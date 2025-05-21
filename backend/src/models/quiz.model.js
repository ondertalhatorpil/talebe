// src/models/quiz.model.js
const { pool } = require('../config/database');
const Question = require('./question.model');
const User = require('./user.model');

// MySQL bağlantı havuzunun mevcut execute fonksiyonunu yedekleyelim ve kontrol edelim
// Bu kodu her dosyaya eklemek yerine, bir utility fonksiyonu olarak çıkarabilirsiniz
if (!pool.originalExecute) {
  pool.originalExecute = pool.execute;
  
  // MySQL'in LIMIT ve OFFSET parametrelerini doğru işlemesi için düzeltme
  pool.execute = function(sql, params, ...args) {
    // Sorguyu kontrol et - LIMIT veya OFFSET içeriyor mu?
    if (typeof sql === 'string' && (sql.includes('LIMIT ?') || sql.includes('OFFSET ?'))) {
      // Parametreleri log ile kontrol et
      console.log('Orijinal SQL:', sql);
      console.log('Orijinal parametreler:', params);
      
      // Parametreleri doğrudan SQL sorgusuna yerleştir
      let updatedSql = sql;
      let updatedParams = [...params]; // Parametrelerin bir kopyasını al
      
      // LIMIT ? kısmını düzelt
      if (updatedSql.includes('LIMIT ?')) {
        // LIMIT parametresinin konumunu bul
        const limitIndex = updatedParams.length - (updatedSql.includes('OFFSET ?') ? 2 : 1);
        // Değeri sayıya dönüştür (eğer zaten sayı değilse)
        const limitValue = parseInt(updatedParams[limitIndex], 10);
        // SQL sorgusundaki LIMIT ? ifadesini gerçek değerle değiştir
        updatedSql = updatedSql.replace('LIMIT ?', `LIMIT ${limitValue}`);
        // Kullanılan parametreyi diziden çıkar
        updatedParams.splice(limitIndex, 1);
      }
      
      // OFFSET ? kısmını düzelt
      if (updatedSql.includes('OFFSET ?')) {
        // OFFSET parametresinin konumunu bul (dizinin son elemanı)
        const offsetIndex = updatedParams.length - 1;
        // Değeri sayıya dönüştür (eğer zaten sayı değilse)
        const offsetValue = parseInt(updatedParams[offsetIndex], 10);
        // SQL sorgusundaki OFFSET ? ifadesini gerçek değerle değiştir
        updatedSql = updatedSql.replace('OFFSET ?', `OFFSET ${offsetValue}`);
        // Kullanılan parametreyi diziden çıkar
        updatedParams.splice(offsetIndex, 1);
      }
      
      // Düzeltilmiş SQL ve parametreleri logla
      console.log('Düzeltilmiş SQL:', updatedSql);
      console.log('Düzeltilmiş parametreler:', updatedParams);
      
      // Orijinal execute fonksiyonunu düzeltilmiş değerlerle çağır
      return pool.originalExecute.call(this, updatedSql, updatedParams, ...args);
    }
    
    // LIMIT veya OFFSET içermeyen normal sorgular için orijinal fonksiyonu çağır
    return pool.originalExecute.call(this, sql, params, ...args);
  };
}

class Quiz {
  static async createQuizByCategory(userId, categoryId, questionCount = 10) {
    try {
      // String parametreleri sayıya dönüştür (LIMIT için kritik)
      const numericCategoryId = parseInt(categoryId, 10);
      const numericQuestionCount = parseInt(questionCount, 10);
      
      // Günlük limit kontrolü
      const limitCheck = await User.checkDailyLimit(userId, numericCategoryId);
      if (limitCheck.limit_reached) {
        throw new Error('Bu kategori için günlük soru limitine ulaştınız.');
      }
      
      // Son 1 hafta içinde cevaplanmış soruları bul
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const [recentlyAnsweredRows] = await pool.execute(
        `SELECT DISTINCT question_id 
         FROM user_answers 
         WHERE user_id = ? 
         AND question_id IN (SELECT id FROM questions WHERE category = ?)
         AND answered_at > ?`,
        [userId, numericCategoryId, oneWeekAgo]
      );
      
      const recentlyAnsweredQuestionIds = recentlyAnsweredRows.map(row => row.question_id);
      
      // Maksimum soru sayısı kontrolü
      const availableQuestionCount = Math.min(numericQuestionCount, limitCheck.remaining);
      // Sayıya dönüştür (LIMIT için kritik)
      const numericAvailableQuestionCount = parseInt(availableQuestionCount, 10);
      
      console.log(`DEBUG: Quiz oluşturuluyor - categoryId: ${numericCategoryId}, limit: ${numericAvailableQuestionCount}`);
      
      // Boş IN clause kontrolü eklendi
      let query = `
        SELECT id, question_text, difficulty, points 
        FROM questions 
        WHERE category = ?
      `;
      
      const params = [numericCategoryId];
      
      // Sadece recent IDs varsa hariç tut
      if (recentlyAnsweredQuestionIds.length > 0) {
        // IN clause için placeholder'lar oluştur
        const placeholders = recentlyAnsweredQuestionIds.map(() => '?').join(',');
        query += ` AND id NOT IN (${placeholders})`;
        params.push(...recentlyAnsweredQuestionIds);
      }
      
      // LIMIT için doğrudan sayısal değer kullan
      query += ` ORDER BY RAND() LIMIT ${numericAvailableQuestionCount}`;
      
      // Debug için sorgu ve parametreleri logla
      console.log('Quiz sorgusu:', query);
      console.log('Parametreler:', params);
      
      // Soruları çek - execute yerine query kullan
      let [questions] = await pool.query(query, params);
      
      // Eğer yeterli soru bulunamadıysa ve eski sorular varsa, eski soruları da dahil et
      if (questions.length < numericAvailableQuestionCount && recentlyAnsweredQuestionIds.length > 0) {
        const remainingCount = numericAvailableQuestionCount - questions.length;
        
        // placeholders ile IN clause oluştur
        const placeholders = recentlyAnsweredQuestionIds.map(() => '?').join(',');
        
        // LIMIT için doğrudan sayısal değer kullan
        const oldQuestionsQuery = `
          SELECT id, question_text, difficulty, points 
          FROM questions 
          WHERE category = ? 
          AND id IN (${placeholders})
          ORDER BY RAND() 
          LIMIT ${remainingCount}
        `;
        
        const [oldQuestions] = await pool.query(
          oldQuestionsQuery,
          [numericCategoryId, ...recentlyAnsweredQuestionIds]
        );
        
        questions = [...questions, ...oldQuestions];
      }
      
      // Eğer hiç soru yoksa hata dön
      if (questions.length === 0) {
        throw new Error('Bu kategoride mevcut soru bulunmuyor.');
      }
      
      // Her soru için cevapları getir
      const questionsWithAnswers = await Promise.all(questions.map(async (question) => {
        const [answers] = await pool.execute(
          'SELECT id, answer_text FROM answers WHERE question_id = ? ORDER BY RAND()',
          [question.id]
        );
        
        return {
          ...question,
          answers,
          time_limit: 20
        };
      }));
      
      return {
        category_id: categoryId,
        questions: questionsWithAnswers,
        total_questions: questionsWithAnswers.length,
        daily_limit_info: limitCheck
      };
    } catch (error) {
      console.error('Quiz creation error:', error);
      throw error;
    }
  }
  
  // Soruyu cevapla (süre sınırı kontrollü)
  static async answerQuestion(userId, questionId, answerId, responseTime) {
    try {
      // Yanıt süresi kontrolü (20 sn'den fazla sürdüyse)
      if (responseTime > 20) {
        // Süre aşımı - otomatik yanlış olarak işaretle
        await pool.execute(
          `INSERT INTO user_answers 
           (user_id, question_id, answer_id, is_correct, points_earned, response_time) 
           VALUES (?, ?, ?, FALSE, 0, ?)`,
          [userId, questionId, answerId, responseTime]
        );
        
        return {
          is_correct: false,
          points_earned: 0,
          message: 'Süre aşımı, yanıt kabul edilmedi.',
          response_time: responseTime
        };
      }
      
      // Normal cevap işleme
      return await Question.answerQuestion(userId, questionId, answerId, responseTime);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Quiz;