const { pool } = require('../config/database');

class Joker {
    /**
     * Kullanıcının günlük joker kullanım durumunu kontrol et
     * @param {number} userId - Kullanıcı ID
     * @param {number} categoryId - Kategori ID
     * @returns {Promise<Object>} - Joker kullanım durumu
     */
    static async checkJokerStatus(userId, categoryId) {
      try {
        const today = new Date().toISOString().split('T')[0];  // YYYY-MM-DD formatında bugünün tarihi
        
        // Bugün için joker kaydı var mı kontrol et
        const [rows] = await pool.execute(
          `SELECT * FROM daily_jokers 
           WHERE user_id = ? AND category_id = ? AND date = ?`,
          [userId, categoryId, today]
        );
        
        // Joker kaydı yoksa yeni kayıt oluştur
        if (rows.length === 0) {
          await pool.execute(
            `INSERT INTO daily_jokers (user_id, category_id, date, double_answer_used, fifty_percent_used)
             VALUES (?, ?, ?, 0, 0)`,
            [userId, categoryId, today]
          );
          
          return {
            double_answer: { 
              limit: 2, 
              used: 0, 
              remaining: 2 
            },
            fifty_percent: { 
              limit: 1, 
              used: 0, 
              remaining: 1 
            }
          };
        }
        
        // Joker durumunu döndür
        const jokerStatus = rows[0];
        return {
          double_answer: {
            limit: 2,
            used: jokerStatus.double_answer_used,
            remaining: Math.max(0, 2 - jokerStatus.double_answer_used)
          },
          fifty_percent: {
            limit: 1,
            used: jokerStatus.fifty_percent_used,
            remaining: Math.max(0, 1 - jokerStatus.fifty_percent_used)
          }
        };
      } catch (error) {
        throw error;
      }
    }
    
    /**
     * %50 jokerini kullan
     * @param {number} userId - Kullanıcı ID
     * @param {number} categoryId - Kategori ID
     * @param {number} questionId - Soru ID
     * @returns {Promise<Object>} - Elenen cevap ID'leri
     */
    static async useFiftyPercentJoker(userId, categoryId, questionId) {
      try {
        // Joker kullanım hakkını kontrol et
        const jokerStatus = await this.checkJokerStatus(userId, categoryId);
        
        if (jokerStatus.fifty_percent.remaining <= 0) {
          throw new Error('Bu kategori için günlük %50 jokeri hakkınız kalmadı.');
        }
        
        // Sorunun cevaplarını al
        const [answerRows] = await pool.execute(
          `SELECT id, is_correct FROM answers WHERE question_id = ?`,
          [questionId]
        );
        
        if (answerRows.length < 4) {
          throw new Error('Bu soru için yeterli sayıda cevap seçeneği bulunmuyor.');
        }
        
        // Yanlış cevapları bul
        const wrongAnswers = answerRows.filter(answer => !answer.is_correct);
        
        // En az 2 yanlış cevap olmalı
        if (wrongAnswers.length < 2) {
          throw new Error('Bu soru için %50 jokeri kullanılamaz.');
        }
        
        // Rastgele 2 yanlış cevap seç
        const shuffledWrongAnswers = wrongAnswers.sort(() => 0.5 - Math.random());
        const eliminatedAnswers = shuffledWrongAnswers.slice(0, 2);
        
        // Joker kullanımını kaydet
        const today = new Date().toISOString().split('T')[0];
        await pool.execute(
          `UPDATE daily_jokers 
           SET fifty_percent_used = fifty_percent_used + 1 
           WHERE user_id = ? AND category_id = ? AND date = ?`,
          [userId, categoryId, today]
        );
        
        // Log kaydı oluştur
        await pool.execute(
          `INSERT INTO joker_usage_log (user_id, category_id, question_id, joker_type, used_at)
           VALUES (?, ?, ?, 'fifty_percent', NOW())`,
          [userId, categoryId, questionId]
        );
        
        return {
          success: true,
          eliminated_answer_ids: eliminatedAnswers.map(answer => answer.id)
        };
      } catch (error) {
        throw error;
      }
    }
    
    /**
     * Çift cevap jokerini kullan
     * @param {number} userId - Kullanıcı ID
     * @param {number} categoryId - Kategori ID
     * @param {number} questionId - Soru ID
     * @returns {Promise<Object>} - Joker kullanım sonucu
     */
    static async useDoubleAnswerJoker(userId, categoryId, questionId) {
      try {
        // Joker kullanım hakkını kontrol et
        const jokerStatus = await this.checkJokerStatus(userId, categoryId);
        
        if (jokerStatus.double_answer.remaining <= 0) {
          throw new Error('Bu kategori için günlük çift cevap jokeri hakkınız kalmadı.');
        }
        
        // Joker kullanımını kaydet
        const today = new Date().toISOString().split('T')[0];
        await pool.execute(
          `UPDATE daily_jokers 
           SET double_answer_used = double_answer_used + 1 
           WHERE user_id = ? AND category_id = ? AND date = ?`,
          [userId, categoryId, today]
        );
        
        // Log kaydı oluştur
        await pool.execute(
          `INSERT INTO joker_usage_log (user_id, category_id, question_id, joker_type, used_at)
           VALUES (?, ?, ?, 'double_answer', NOW())`,
          [userId, categoryId, questionId]
        );
        
        return {
          success: true,
          message: 'Çift cevap jokeri aktifleştirildi. Yanlış cevap verirseniz, bir kez daha cevaplama hakkınız olacak.'
        };
      } catch (error) {
        throw error;
      }
    }
    
    /**
     * Soru için çift cevap jokeri aktif mi kontrol et
     * @param {number} userId - Kullanıcı ID
     * @param {number} questionId - Soru ID
     * @returns {Promise<boolean>} - Çift cevap jokeri aktif mi?
     */
    static async isDoubleAnswerActive(userId, questionId) {
      try {
        // Soru için çift cevap jokeri kullanılmış mı kontrol et
        const [rows] = await pool.execute(
          `SELECT * FROM joker_usage_log 
           WHERE user_id = ? AND question_id = ? AND joker_type = 'double_answer'
           AND used_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,  // Son 1 saat içinde
          [userId, questionId]
        );
        
        // Kullanıcı bu soru için cevap vermiş mi kontrol et
        const [answerRows] = await pool.execute(
          `SELECT * FROM user_answers 
           WHERE user_id = ? AND question_id = ?`,
          [userId, questionId]
        );
        
        // Çift cevap jokeri kullanılmış ve bir kez cevap verilmişse aktif
        return rows.length > 0 && answerRows.length === 1;
      } catch (error) {
        throw error;
      }
    }
}

// ✅ EXPORT EKLENDI - Bu satır eksikti!
module.exports = Joker;