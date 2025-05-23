const { pool } = require('../config/database');

class Question {
/**
 * Yeni soru oluştur
 * @param {Object} questionData - Soru bilgileri ve cevapları
 * @returns {Promise<Object>} - Oluşturulan soru
 */
static async create(questionData) {
  try {
    const { question_text, user_type, category, difficulty, answers } = questionData;

    // Soft hyphen karakterlerini temizle
    const cleanQuestionText = question_text.replace(/­/g, '');
    const cleanAnswers = answers.map(answer => ({
      ...answer,
      answer_text: answer.answer_text.replace(/­/g, '')
    }));

    let points;
    switch(difficulty) {
      case 'kolay':
        points = 5;
        break;
      case 'orta':
        points = 10;
        break;
      case 'zor':
        points = 20;
        break;
      default:
        points = 10; // Varsayılan değer
    }
    
    // Cevap kontrolü
    if (!cleanAnswers || !Array.isArray(cleanAnswers) || cleanAnswers.length < 2) {
      throw new Error('En az 2 cevap seçeneği gereklidir.');
    }

    // Doğru cevap kontrolü
    const correctAnswers = cleanAnswers.filter(answer => answer.is_correct);
    if (correctAnswers.length === 0) {
      throw new Error('En az bir doğru cevap seçeneği olmalıdır.');
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Soruyu veritabanına ekle
      const [questionResult] = await connection.execute(
        `INSERT INTO questions 
         (question_text, user_type, category, difficulty, points) 
         VALUES (?, ?, ?, ?, ?)`,
        [cleanQuestionText, user_type, category, difficulty, points]
      );
        
      const questionId = questionResult.insertId;
      
      // Cevapları veritabanına ekle
      for (const answer of cleanAnswers) {
        await connection.execute(
          `INSERT INTO answers 
           (question_id, answer_text, is_correct) 
           VALUES (?, ?, ?)`,
          [questionId, answer.answer_text, answer.is_correct]
        );
      }
      
      await connection.commit();
      connection.release();
      
      // Oluşturulan soruyu cevaplarıyla birlikte döndür
      return this.findByIdWithAnswers(questionId);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    throw error;
  }
}
  
  /**
   * ID'ye göre soru bul (cevaplar dahil)
   * @param {number} id - Soru ID
   * @returns {Promise<Object|null>} - Bulunan soru veya null
   */
  static async findByIdWithAnswers(id) {
    try {
      // Soruyu al
      const [questionRows] = await pool.execute(
        'SELECT * FROM questions WHERE id = ?',
        [id]
      );
      
      if (questionRows.length === 0) {
        return null;
      }
      
      const question = questionRows[0];
      
      // Cevapları al
      const [answerRows] = await pool.execute(
        'SELECT id, answer_text, is_correct FROM answers WHERE question_id = ? ORDER BY id',
        [id]
      );
      
      question.answers = answerRows;
      
      return question;
    } catch (error) {
      throw error;
    }
  }
  
/**
 * Soruları filtrele ve getir
 * @param {Object} filters - Filtre parametreleri
 * @param {number} limit - Maksimum soru sayısı
 * @param {number} offset - Başlangıç indeksi
 * @returns {Promise<Array>} - Soru listesi
 */
static async getQuestions(filters = {}, limit = 10, offset = 0) {
  try {
    // Sayısal parametrelerin dönüşümünü garantiye al
    const numericLimit = parseInt(limit, 10);
    const numericOffset = parseInt(offset, 10);
    
    console.log(`DEBUG: getQuestions - limit: ${numericLimit}, offset: ${numericOffset}`);
    
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params = [];
    
    // Kullanıcı tipine göre filtrele
    if (filters.user_type) {
      query += ' AND (user_type = ? OR user_type = "both")';
      params.push(filters.user_type);
    }
    
    // Kategoriye göre filtrele
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    
    // Zorluk seviyesine göre filtrele
    if (filters.difficulty) {
      query += ' AND difficulty = ?';
      params.push(filters.difficulty);
    }
    
    // ID listesini hariç tut (daha önce cevaplanmış soruları filtrelemek için)
    if (filters.exclude_ids && Array.isArray(filters.exclude_ids) && filters.exclude_ids.length > 0) {
      query += ` AND id NOT IN (${filters.exclude_ids.map(() => '?').join(',')})`;
      params.push(...filters.exclude_ids);
    }
    
    // LIMIT parametresini doğrudan ekleyelim - prepared statement kullanmadan
    query += ` ORDER BY RAND() LIMIT ${numericLimit} OFFSET ${numericOffset}`;
    
    console.log('SQL Sorgusu:', query);
    console.log('Parametreler:', params);
    
    // Sorguyu direkt olarak çalıştır - LIMIT ve OFFSET için hazırlanan parametreler yok
    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error('getQuestions error:', error);
    throw error;
  }
}
  
/**
 * Soruyu cevaplarıyla birlikte güncelle
 * @param {number} id - Soru ID
 * @param {Object} questionData - Güncellenecek soru verileri
 * @returns {Promise<Object|null>} - Güncellenmiş soru
 */
static async update(id, questionData) {
  try {
    const { question_text, user_type, category, difficulty, answers } = questionData;

    // Soft hyphen karakterlerini temizle
    const cleanQuestionText = question_text.replace(/­/g, '');
    const cleanAnswers = answers.map(answer => ({
      ...answer,
      answer_text: answer.answer_text.replace(/­/g, '')
    }));

    let points;
    switch(difficulty) {
      case 'kolay':
        points = 5;
        break;
      case 'orta':
        points = 10;
        break;
      case 'zor':
        points = 20;
        break;
      default:
        points = 10; // Varsayılan değer
    }
    
    // Sorunun varlığını kontrol et
    const question = await this.findByIdWithAnswers(id);
    if (!question) {
      return null;
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      await connection.execute(
        `UPDATE questions 
         SET question_text = ?, user_type = ?, category = ?, difficulty = ?, points = ? 
         WHERE id = ?`,
        [cleanQuestionText, user_type, category, difficulty, points, id]
      );
      
      // Mevcut cevapları sil
      await connection.execute('DELETE FROM answers WHERE question_id = ?', [id]);
      
      // Yeni cevapları ekle
      for (const answer of cleanAnswers) {
        await connection.execute(
          `INSERT INTO answers 
           (question_id, answer_text, is_correct) 
           VALUES (?, ?, ?)`,
          [id, answer.answer_text, answer.is_correct]
        );
      }
      
      await connection.commit();
      connection.release();
      
      // Güncellenmiş soruyu cevaplarıyla birlikte döndür
      return this.findByIdWithAnswers(id);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    throw error;
  }
}
  
/**
 * Soruyu sil (tüm ilişkili kayıtlarla birlikte)
 * @param {number} id - Soru ID
 * @returns {Promise<boolean>} - Başarılı mı?
 */
static async delete(id) {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 1. joker_usage_log tablosundaki kayıtları sil
      await connection.execute('DELETE FROM joker_usage_log WHERE question_id = ?', [id]);
      
      // 2. user_answers tablosundaki kayıtları sil
      await connection.execute('DELETE FROM user_answers WHERE question_id = ?', [id]);
      
      // 3. answers tablosundaki kayıtları sil 
      await connection.execute('DELETE FROM answers WHERE question_id = ?', [id]);
      
      // 4. Son olarak soruyu sil
      const [result] = await connection.execute('DELETE FROM questions WHERE id = ?', [id]);
      
      await connection.commit();
      connection.release();
      
      console.log(`Soru ve tüm ilişkili kayıtlar silindi: ID=${id}`);
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    throw error;
  }
}
  
  /**
   * Belirli kategorileri olan soruları getir
   * @returns {Promise<Array>} - Kategori listesi
   */
  static async getCategories() {
    try {
      const [rows] = await pool.execute('SELECT DISTINCT category FROM questions ORDER BY category');
      return rows.map(row => row.category);
    } catch (error) {
      throw error;
    }
  }
  
static async answerQuestion(userId, questionId, answerId, responseTime = null) {
  try {
    // Çift cevap jokerinin aktif olup olmadığını kontrol et
    const [jokerRows] = await pool.execute(`
      SELECT * FROM joker_usage_log 
      WHERE user_id = ? AND question_id = ? AND joker_type = 'double_answer'
      AND used_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `, [userId, questionId]);
    
    const isDoubleAnswerActive = jokerRows.length > 0;
    
    // Bu soru için verilen cevap sayısını kontrol et
    const [existingAnswers] = await pool.execute(
      'SELECT COUNT(*) as count FROM user_answers WHERE user_id = ? AND question_id = ?',
      [userId, questionId]
    );
    
    const isSecondAttempt = isDoubleAnswerActive && existingAnswers[0].count === 1;
    
    // Soruyu ve seçilen cevabı al
    const question = await this.findByIdWithAnswers(questionId);
    if (!question) {
      throw new Error('Soru bulunamadı.');
    }
    
    // Seçilen cevabı bul
    const selectedAnswer = question.answers.find(answer => answer.id === answerId);
    if (!selectedAnswer) {
      throw new Error('Geçersiz cevap.');
    }
    
    // Doğru/yanlış kontrolü ve puan hesaplama
    const isCorrect = selectedAnswer.is_correct;
    
    let pointsEarned = 0;
    if (isCorrect) {
      // Temel puanı zorluk seviyesine göre belirle
      switch (question.difficulty) {
        case 'kolay': pointsEarned = 5; break;
        case 'orta': pointsEarned = 10; break;
        case 'zor': pointsEarned = 20; break;
        default: pointsEarned = 10;
      }
      
      // Hızlı cevap bonusu (opsiyonel)
      if (responseTime !== null && responseTime <= 10) {
        const timeBonus = Math.floor((20 - responseTime) / 2);
        pointsEarned += timeBonus;
      }
      
      // Çift cevap jokerinde ikinci deneme ise puan azalt
      if (isSecondAttempt) {
        pointsEarned = Math.floor(pointsEarned * 0.5); // %50 puan
      }
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    let pointDifferenceForSchool = 0; // Okul puanı için kullanılacak
    
    try {
      // Çift cevap jokerinde ikinci deneme ise önceki cevabı güncelle
      if (isSecondAttempt) {
        // Önceki puanı al
        const [prevAnswer] = await connection.execute(
          'SELECT points_earned FROM user_answers WHERE user_id = ? AND question_id = ?',
          [userId, questionId]
        );
        const prevPoints = prevAnswer[0]?.points_earned || 0;
        
        await connection.execute(
          `UPDATE user_answers 
           SET answer_id = ?, is_correct = ?, points_earned = ?, response_time = ?
           WHERE user_id = ? AND question_id = ?`,
          [answerId, isCorrect, pointsEarned, responseTime, userId, questionId]
        );
        
        // Puan farkını hesapla
        pointDifferenceForSchool = pointsEarned - prevPoints;
        
        // Kullanıcının puanını güncelle (transaction içinde)
        if (pointDifferenceForSchool !== 0) {
          await connection.execute(
            'UPDATE users SET points = points + ? WHERE id = ?',
            [pointDifferenceForSchool, userId]
          );
        }
      } else {
        // Normal cevap veya ilk deneme
        await connection.execute(
          `INSERT INTO user_answers 
           (user_id, question_id, answer_id, is_correct, points_earned, response_time) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, questionId, answerId, isCorrect, pointsEarned, responseTime]
        );
        
        // Kullanıcının puanını güncelle (transaction içinde)
        if (pointsEarned > 0) {
          await connection.execute(
            'UPDATE users SET points = points + ? WHERE id = ?',
            [pointsEarned, userId]
          );
          pointDifferenceForSchool = pointsEarned;
        }
      }
      
      await connection.commit();
      connection.release();
      
      // Transaction tamamlandıktan SONRA okul puanını güncelle
      if (pointDifferenceForSchool > 0) {
        try {
          // Kullanıcının okulunu bul
          const [userRows] = await pool.execute(
            'SELECT school_id FROM users WHERE id = ?',
            [userId]
          );
          
          if (userRows.length > 0 && userRows[0].school_id) {
            // Okul toplam puanını güncelle
            await pool.execute(
              'UPDATE schools SET total_points = (SELECT SUM(points) FROM users WHERE school_id = ?) WHERE id = ?',
              [userRows[0].school_id, userRows[0].school_id]
            );
          }
        } catch (schoolUpdateError) {
          console.error('Okul puanı güncellenirken hata:', schoolUpdateError);
          // Okul puanı güncellenemese bile ana işlem devam etsin
        }
      }
      
      // Kullanıcının güncellenmiş puanını al
      const [finalUserRows] = await pool.execute(
        'SELECT points FROM users WHERE id = ?',
        [userId]
      );
      
      // Çift cevap jokerinde ilk deneme ve yanlış cevap ise doğru cevabı DÖNME
      const correctAnswerId = question.answers.find(answer => answer.is_correct).id;
      
      // Çift cevap jokerinde ilk deneme ve yanlış ise second_chance: true
      const secondChance = isDoubleAnswerActive && !isSecondAttempt && !isCorrect;
      
      return {
        is_correct: isCorrect,
        points_earned: pointsEarned,
        current_points: finalUserRows[0].points,
        // Çift cevap jokerinde ilk yanlış denemede doğru cevabı gösterme
        correct_answer_id: (secondChance) ? null : correctAnswerId,
        response_time: responseTime,
        second_chance: secondChance,
        is_second_attempt: isSecondAttempt
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    throw error;
  }
}
  
/**
 * Kullanıcının yanıtladığı soruları getir
 * @param {number} userId - Kullanıcı ID
 * @param {number} limit - Maksimum kayıt sayısı
 * @param {number} offset - Başlangıç indeksi
 * @returns {Promise<Array>} - Yanıtlanmış soru listesi
 */
static async getUserAnsweredQuestions(userId, limit = 10, offset = 0) {
  try {
    // Sayısal parametrelerin dönüşümünü garantiye al
    const numericLimit = parseInt(limit, 10);
    const numericOffset = parseInt(offset, 10);
    const numericUserId = parseInt(userId, 10);
    
    console.log(`DEBUG: getUserAnsweredQuestions çağrıldı - userId: ${numericUserId}, limit: ${numericLimit}, offset: ${numericOffset}`);
    
    const query = `
      SELECT 
        q.id as question_id, 
        q.question_text,
        q.category,
        q.difficulty,
        a.id as answer_id,
        a.answer_text,
        ua.is_correct,
        ua.points_earned,
        ua.answered_at
      FROM 
        user_answers ua
      INNER JOIN 
        questions q ON ua.question_id = q.id
      INNER JOIN 
        answers a ON ua.answer_id = a.id
      WHERE 
        ua.user_id = ?
      ORDER BY 
        ua.answered_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await pool.execute(query, [numericUserId, numericLimit, numericOffset]);
    return rows;
  } catch (error) {
    console.error('getUserAnsweredQuestions error:', error);
    throw error;
  }
}
  
  /**
   * Kullanıcının toplam doğru ve yanlış cevap sayılarını getir
   * @param {number} userId - Kullanıcı ID
   * @returns {Promise<Object>} - İstatistikler
   */
  static async getUserAnswerStats(userId) {
    try {
      const query = `
        SELECT 
          SUM(is_correct = 1) as correct_count,
          SUM(is_correct = 0) as wrong_count,
          COUNT(*) as total_count,
          SUM(points_earned) as total_points_earned
        FROM 
          user_answers
        WHERE 
          user_id = ?
      `;
      
      const [rows] = await pool.execute(query, [userId]);
      
      if (rows.length === 0) {
        return {
          correct_count: 0,
          wrong_count: 0,
          total_count: 0,
          total_points_earned: 0,
          accuracy_rate: 0
        };
      }
      
      const stats = rows[0];
      stats.accuracy_rate = stats.total_count > 0 
        ? (stats.correct_count / stats.total_count * 100).toFixed(2) 
        : 0;
      
      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Question;