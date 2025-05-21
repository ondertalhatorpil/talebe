// src/models/quiz.model.js
const { pool } = require('../config/database');
const Question = require('./question.model');
const User = require('./user.model');

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
    
    query += ` ORDER BY RAND() LIMIT ?`;
    // ÖNEMLİ: sayısal değeri ekle
    params.push(numericAvailableQuestionCount);
    
    // Debug için sorgu ve parametreleri logla
    console.log('Quiz sorgusu:', query);
    console.log('Parametreler:', params);
    
    // Soruları çek
    let [questions] = await pool.execute(query, params);
    
    // Eğer yeterli soru bulunamadıysa ve eski sorular varsa, eski soruları da dahil et
    if (questions.length < numericAvailableQuestionCount && recentlyAnsweredQuestionIds.length > 0) {
      const remainingCount = numericAvailableQuestionCount - questions.length;
      
      // placeholders ile IN clause oluştur
      const placeholders = recentlyAnsweredQuestionIds.map(() => '?').join(',');
      
      const [oldQuestions] = await pool.execute(
        `SELECT id, question_text, difficulty, points 
         FROM questions 
         WHERE category = ? 
         AND id IN (${placeholders})
         ORDER BY RAND() 
         LIMIT ?`,
        [numericCategoryId, ...recentlyAnsweredQuestionIds, remainingCount]
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