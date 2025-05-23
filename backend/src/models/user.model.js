const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  /**
   * Yeni kullanıcı oluştur
   * @param {Object} userData - Kullanıcı bilgileri
   * @returns {Promise<Object>} - Oluşturulan kullanıcı bilgisi (şifre hariç)
   */
  static async create(userData) {
    const { first_name, last_name, email, password, birth_date, user_type, school_id, class: studentClass, gender } = userData;
    
    try {
      // Şifreyi hashle
      const hashedPassword = await this.hashPassword(password);
      
      const connection = await pool.getConnection();
      
      // Kullanıcıyı veritabanına ekle
      const [result] = await connection.execute(
        `INSERT INTO users 
         (first_name, last_name, email, password, birth_date, user_type, school_id, class, gender) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, email, hashedPassword, birth_date, user_type, school_id, studentClass, gender || 'belirtilmedi']
      );
      
      connection.release();
      
      if (result.insertId) {
        // Okul total_students sayacını güncelle
        await this.updateSchoolStudentCount(school_id);
        
        // Oluşturulan kullanıcıyı döndür (şifre hariç)
        return this.findById(result.insertId);
      }
      
      throw new Error('Kullanıcı oluşturulamadı');
    } catch (error) {
      throw error;
    }
  }


  static async isAdmin(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT is_admin FROM users WHERE id = ?',
        [userId]
      );
      
      return rows.length > 0 ? rows[0].is_admin === 1 : false;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Şifreyi hashle
   * @param {string} password - Düz metin şifre
   * @returns {Promise<string>} - Haslenmiş şifre
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }
  
  /**
   * Email adresine göre kullanıcı bul
   * @param {string} email - Kullanıcı email adresi
   * @returns {Promise<Object|null>} - Bulunan kullanıcı veya null
   */
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
/**
 * ID'ye göre kullanıcı bul (okul bilgileriyle birlikte)
 * @param {number} id - Kullanıcı ID
 * @returns {Promise<Object|null>} - Bulunan kullanıcı veya null
 */
static async findById(id) {
  try {
    console.log('User.findById called with ID:', id); // DEBUG
    
    const [rows] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.birth_date, u.user_type, 
              u.school_id, u.class, u.gender, u.points, u.register_date, u.last_login, 
              u.is_admin,
              s.id as s_id, s.name as s_name, s.city as s_city, s.district as s_district
       FROM users u
       LEFT JOIN schools s ON u.school_id = s.id
       WHERE u.id = ?`,
      [id]
    );
    
    console.log('Query result:', rows); // DEBUG
    
    if (rows.length > 0) {
      const user = rows[0];
      console.log('Found user:', user); // DEBUG
      
      // Okul bilgisini ayrı bir nesne olarak ekle
      if (user.school_id && user.s_id) {
        user.school = {
          id: user.school_id,
          name: user.s_name,
          city: user.s_city,
          district: user.s_district
        };
        console.log('Added school info:', user.school); // DEBUG
      } else {
        console.log('No school info found for user'); // DEBUG
      }
      
      // SQL sonucundaki gereksiz alanları temizle
      delete user.s_id;
      delete user.s_name;
      delete user.s_city;
      delete user.s_district;
      
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('User.findById error:', error); // DEBUG
    throw error;
  }
}
  
  /**
   * Kullanıcı profil bilgilerini güncelle
   * @param {number} userId - Kullanıcı ID
   * @param {Object} updateData - Güncellenecek veriler
   * @returns {Promise<boolean>} - Başarılı mı?
   */
  static async updateProfile(userId, updateData) {
    try {
      const { first_name, last_name, gender } = updateData;
      
      const [result] = await pool.execute(
        'UPDATE users SET first_name = ?, last_name = ?, gender = ? WHERE id = ?',
        [first_name, last_name, gender, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Kullanıcı şifresini kontrol et
   * @param {string} plainPassword - Düz metin şifre
   * @param {string} hashedPassword - Hash'lenmiş şifre
   * @returns {Promise<boolean>} - Şifre doğru mu?
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * Kullanıcı son giriş zamanını güncelle
   * @param {number} userId - Kullanıcı ID
   * @returns {Promise<boolean>} - Başarılı mı?
   */
  static async updateLastLogin(userId) {
    try {
      const [result] = await pool.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Okul öğrenci sayısını güncelle
   * @param {number} schoolId - Okul ID
   * @returns {Promise<boolean>} - Başarılı mı?
   */
  static async updateSchoolStudentCount(schoolId) {
    try {
      const [result] = await pool.execute(
        'UPDATE schools SET total_students = (SELECT COUNT(*) FROM users WHERE school_id = ?) WHERE id = ?',
        [schoolId, schoolId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Kullanıcı puanını güncelle
   * @param {number} userId - Kullanıcı ID
   * @param {number} pointsToAdd - Eklenecek puan (negatif değer olabilir)
   * @returns {Promise<Object>} - Güncellenmiş kullanıcı puanı
   */
  static async updatePoints(userId, pointsToAdd) {
    try {
      const connection = await pool.getConnection();
      
      // Kullanıcı puanını güncelle
      await connection.execute(
        'UPDATE users SET points = points + ? WHERE id = ?',
        [pointsToAdd, userId]
      );
      
      // Güncellenmiş kullanıcı puanını al
      const [rows] = await connection.execute(
        'SELECT points FROM users WHERE id = ?',
        [userId]
      );
      
      // Kullanıcının okulunu bul
      const [userRows] = await connection.execute(
        'SELECT school_id FROM users WHERE id = ?',
        [userId]
      );
      
      connection.release();
      
      if (userRows.length > 0 && userRows[0].school_id) {
        // Okul toplam puanını güncelle
        await pool.execute(
          'UPDATE schools SET total_points = (SELECT SUM(points) FROM users WHERE school_id = ?) WHERE id = ?',
          [userRows[0].school_id, userRows[0].school_id]
        );
      }
      
      return rows.length > 0 ? { points: rows[0].points } : null;
    } catch (error) {
      throw error;
    }
  }

/**
 * Kullanıcının detaylı istatistiklerini al
 */
static async getUserStats(userId) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.points,
        COUNT(ua.id) as total_questions,
        SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        ROUND(
          (SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ua.id), 0)), 
          2
        ) as average_score,
        COUNT(DISTINCT DATE(ua.answered_at)) as total_quizzes,
        AVG(ua.response_time) as average_time
      FROM users u
      LEFT JOIN user_answers ua ON u.id = ua.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId]);

    if (rows.length > 0) {
      return {
        points: rows[0].points || 0,
        total_questions: rows[0].total_questions || 0,
        correct_answers: rows[0].correct_answers || 0,
        average_score: rows[0].average_score || 0,
        total_quizzes: rows[0].total_quizzes || 0,
        average_time: rows[0].average_time || 0
      };
    }

    // Eğer kullanıcı hiç quiz çözmemişse, sadece temel bilgileri döndür
    const [userRows] = await pool.execute(`
      SELECT points FROM users WHERE id = ?
    `, [userId]);

    return {
      points: userRows[0]?.points || 0,
      total_questions: 0,
      correct_answers: 0,
      average_score: 0,
      total_quizzes: 0,
      average_time: 0
    };
  } catch (error) {
    console.error('getUserStats error:', error);
    throw error;
  }
}



/**
 * Kullanıcının son aktivitelerini al - Geliştirilmiş versiyon
 */
static async getRecentActivity(userId, limit = 10) {
  try {
    console.log('🚀 getRecentActivity başladı - User ID:', userId);
    
    // limit parametresini sayıya dönüştür (DÜZELTME)
    const numericLimit = parseInt(limit, 10);
    
    // user_answers tablosunda veri olup olmadığını kontrol et
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM user_answers
      WHERE user_id = ?
    `;
    const [checkRows] = await pool.execute(checkQuery, [userId]);
    const recordCount = checkRows[0]?.count || 0;
    
    console.log(`📊 DEBUG: user_answers tablosunda kullanıcı için ${recordCount} kayıt var`);
    
    if (recordCount === 0) {
      console.log('⚠️ DEBUG: Kullanıcı için hiç aktivite bulunamadı');
      return [];
    }
    
    // Örnek kayıtları göster (debug için)
    const sampleQuery = `
      SELECT ua.*, q.category 
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      WHERE ua.user_id = ?
      ORDER BY ua.answered_at DESC
      LIMIT 3
    `;
    const [sampleRows] = await pool.execute(sampleQuery, [userId]);
    console.log('📋 DEBUG: Örnek aktivite kayıtları:', sampleRows);
    
    // İlk yöntem: Kategori tablosu üzerinden
    try {
      console.log('🔍 Method 1: categories tablo JOIN denemesi');
      const query1 = `
        SELECT 
          COALESCE(c.name, q.category) as category,
          COUNT(ua.id) as totalQuestions,
          SUM(ua.points_earned) as totalPoints,
          MAX(ua.answered_at) as timestamp
        FROM user_answers ua
        JOIN questions q ON ua.question_id = q.id
        LEFT JOIN categories c ON c.id = q.category 
        WHERE ua.user_id = ?
        GROUP BY COALESCE(c.name, q.category)
        ORDER BY timestamp DESC
        LIMIT ?
      `;
      
      const [rows1] = await pool.execute(query1, [userId, numericLimit]);
      console.log('📋 Method 1 sonuç:', rows1);
      
      if (rows1 && rows1.length > 0) {
        return rows1;
      }
    } catch (error1) {
      console.error('⚠️ Method 1 sorgu hatası:', error1);
      // Hata durumunda yedek metoda geçiyoruz
    }
    
    // İkinci yöntem: Kategori ismini string olarak kullanarak
    try {
      console.log('🔍 Method 2: categories string match denemesi');
      const query2 = `
        SELECT 
          q.category as category,
          COUNT(ua.id) as totalQuestions,
          SUM(ua.points_earned) as totalPoints,
          MAX(ua.answered_at) as timestamp
        FROM user_answers ua
        JOIN questions q ON ua.question_id = q.id
        LEFT JOIN categories c ON c.name = q.category
        WHERE ua.user_id = ?
        GROUP BY q.category
        ORDER BY timestamp DESC
        LIMIT ?
      `;
      
      const [rows2] = await pool.execute(query2, [userId, numericLimit]);
      console.log('📋 Method 2 sonuç:', rows2);
      
      if (rows2 && rows2.length > 0) {
        return rows2;
      }
    } catch (error2) {
      console.error('⚠️ Method 2 sorgu hatası:', error2);
    }
    
    // Üçüncü yöntem: En basit sorgu, sadece gerekli tabloları kullan
    try {
      console.log('🔍 Method 3: Basitleştirilmiş sorgu denemesi');
      const query3 = `
        SELECT 
          q.category as category,
          COUNT(ua.id) as totalQuestions,
          SUM(ua.points_earned) as totalPoints,
          MAX(ua.answered_at) as timestamp
        FROM user_answers ua
        JOIN questions q ON ua.question_id = q.id
        WHERE ua.user_id = ?
        GROUP BY q.category
        ORDER BY timestamp DESC
        LIMIT ?
      `;
      
      const [rows3] = await pool.execute(query3, [userId, numericLimit]);
      console.log('📋 Method 3 sonuç:', rows3);
      
      if (rows3 && rows3.length > 0) {
        return rows3;
      }
    } catch (error3) {
      console.error('⚠️ Method 3 sorgu hatası:', error3);
    }
    
    // Son çare: Raw sorgulama, herhangi bir veriye ulaşmaya çalış
    try {
      console.log('🔍 Method 4: Sadece user_answers tablosunu kullanma');
      const query4 = `
        SELECT 
          'Aktivite' as category,
          COUNT(id) as totalQuestions,
          SUM(points_earned) as totalPoints,
          MAX(answered_at) as timestamp
        FROM user_answers 
        WHERE user_id = ?
        GROUP BY DATE(answered_at)
        ORDER BY timestamp DESC
        LIMIT ?
      `;
      
      // DÜZELTME: limit parametresini sayı olarak kullan
      const [rows4] = await pool.execute(query4, [userId, numericLimit]);
      console.log('📋 Method 4 sonuç:', rows4);
      
      if (rows4 && rows4.length > 0) {
        return rows4;
      }
    } catch (error4) {
      console.error('⚠️ Method 4 sorgu hatası:', error4);
    }
    
    console.log('❌ Hiçbir aktivite bulunamadı veya sorgular çalışmadı');
    return [];
  } catch (error) {
    console.error('getRecentActivity ana hata:', error);
    return [];
  }
}

/**
 * Kategorilere göre performans - Geliştirilmiş ve debug eklenmiş
 */
static async getCategoryPerformance(userId) {
  try {
    console.log('🧠 DEBUG: getCategoryPerformance başladı - User ID:', userId);
    
    // user_answers tablosunda veri var mı kontrol et
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM user_answers
      WHERE user_id = ?
    `;
    const [checkRows] = await pool.execute(checkQuery, [userId]);
    const recordCount = checkRows[0]?.count || 0;
    
    console.log(`📊 DEBUG: user_answers tablosunda kullanıcı için ${recordCount} kayıt var`);
    
    if (recordCount === 0) {
      console.log('⚠️ DEBUG: Kullanıcı için hiç kayıt bulunamadı');
      return [];
    }
    
    // Örnek kayıtları göster
    const sampleQuery = `
      SELECT ua.*, q.category
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      WHERE ua.user_id = ?
      LIMIT 3
    `;
    const [sampleRows] = await pool.execute(sampleQuery, [userId]);
    console.log('📋 DEBUG: Örnek kayıtlar:', sampleRows);
    
    // Kategori sorgusu
    const query = `
      SELECT 
        q.category as category_name,
        COUNT(ua.id) as total_questions,
        SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        ROUND(
          (SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ua.id), 0)), 
          1
        ) as score,
        COALESCE(SUM(ua.points_earned), 0) as total_points
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      WHERE ua.user_id = ?
      GROUP BY q.category
      HAVING COUNT(ua.id) > 0
      ORDER BY score DESC, total_points DESC
    `;
    
    const [rows] = await pool.execute(query, [userId]);
    console.log('📊 DEBUG: Kategori performansı raw result:', rows);
    
    return rows;
  } catch (error) {
    console.error('❌ DEBUG: getCategoryPerformance error:', error);
    console.error('❌ DEBUG: Error code:', error.code);
    console.error('❌ DEBUG: Error SQL:', error.sql || 'SQL not available');
    
    return [];
  }
}
  

  
  /**
   * En yüksek puanlı kullanıcıları getir
   * @param {string} userType - Kullanıcı tipi (ortaokul/lise/null)
   * @param {number} limit - Maksimum kullanıcı sayısı
   * @returns {Promise<Array>} - Kullanıcı listesi
   */
  static async getTopUsers(userType = null, limit = 10) {
    try {
      let query = `
        SELECT u.id, u.first_name, u.last_name, u.points, u.user_type, 
               s.name as school_name, s.city, s.district
        FROM users u
        LEFT JOIN schools s ON u.school_id = s.id
      `;
      
      const params = [];
      
      if (userType) {
        query += ' WHERE u.user_type = ?';
        params.push(userType);
      }
      
      query += ' ORDER BY u.points DESC LIMIT ?';
      params.push(limit);
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Belirli bir okuldaki en yüksek puanlı kullanıcıları getir
   * @param {number} schoolId - Okul ID
   * @param {number} limit - Maksimum kullanıcı sayısı
   * @returns {Promise<Array>} - Kullanıcı listesi
   */
  static async getTopUsersInSchool(schoolId, limit = 10) {
    try {
      const query = `
        SELECT u.id, u.first_name, u.last_name, u.points, u.user_type, u.class
        FROM users u
        WHERE u.school_id = ?
        ORDER BY u.points DESC LIMIT ?
      `;
      
      const [rows] = await pool.execute(query, [schoolId, limit]);
      return rows;
    } catch (error) {
      throw error;
    }
  }


static async getDailyQuestionCount(userId, categoryId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // categoryId aslında category string'i olabilir
    // Önce numeric mi kontrol et
    const isNumericId = !isNaN(parseInt(categoryId));
    
    let query, params;
    
    if (isNumericId) {
      // Eğer numeric ID ise, category_id varsa onu kullan
      query = `SELECT COUNT(*) as count 
               FROM user_answers ua
               INNER JOIN questions q ON ua.question_id = q.id
               WHERE ua.user_id = ? 
                 AND q.category = ?
                 AND ua.answered_at BETWEEN ? AND ?`;
      params = [userId, categoryId, today, tomorrow];
    } else {
      query = `SELECT COUNT(*) as count 
               FROM user_answers ua
               INNER JOIN questions q ON ua.question_id = q.id  
               WHERE ua.user_id = ? 
                 AND q.category = ?
                 AND ua.answered_at BETWEEN ? AND ?`;
      params = [userId, categoryId, today, tomorrow];
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].count;
  } catch (error) {
    throw error;
  }
}

/**  
 * Kullanıcının Türkiye, İl, İlçe ve Okul bazında genel sıralamasını getir  
 */ 
static async getComprehensiveRanking(userId) {
  try {
    // Önce kullanıcı bilgilerini al
    const [userRows] = await pool.execute(`
      SELECT u.*, s.city, s.district 
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.id = ?
    `, [userId]);
    
    if (userRows.length === 0) {
      return null;
    }
    
    const user = userRows[0];
    
    // Türkiye sıralaması - DÜZELTME: 'rank' yerine 'user_rank' kullanıldı
    const [turkeyRank] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE points > ?) + 1 as user_rank,
        COUNT(*) as total
      FROM users
    `, [user.points]);
    
    // İl sıralaması - user.city null olabilir, kontrol et
    let cityRank = [{ user_rank: 1, total: 1 }];
    if (user.city) {
      [cityRank] = await pool.execute(`
        SELECT 
          (SELECT COUNT(*) 
            FROM users u2
            JOIN schools s2 ON u2.school_id = s2.id
            WHERE s2.city = ? AND u2.points > ?) + 1 as user_rank,
          COUNT(*) as total
        FROM users u
        JOIN schools s ON u.school_id = s.id
        WHERE s.city = ?
      `, [user.city, user.points, user.city]);
    }
    
    // İlçe sıralaması - user.district null olabilir, kontrol et
    let districtRank = [{ user_rank: 1, total: 1 }];
    if (user.city && user.district) {
      [districtRank] = await pool.execute(`
        SELECT 
          (SELECT COUNT(*) 
            FROM users u2
            JOIN schools s2 ON u2.school_id = s2.id
            WHERE s2.city = ? AND s2.district = ? AND u2.points > ?) + 1 as user_rank,
          COUNT(*) as total
        FROM users u
        JOIN schools s ON u.school_id = s.id
        WHERE s.city = ? AND s.district = ?
      `, [user.city, user.district, user.points, user.city, user.district]);
    }
    
    // Okul sıralaması - user.school_id null olabilir, kontrol et
    let schoolRank = [{ user_rank: 1, total: 1 }];
    if (user.school_id) {
      [schoolRank] = await pool.execute(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE school_id = ? AND points > ?) + 1 as user_rank,
          COUNT(*) as total
        FROM users
        WHERE school_id = ?
      `, [user.school_id, user.points, user.school_id]);
    }
    
    // Yüzdelik hesaplama
    const calculatePercentage = (rank, total) => {
      if (!rank || !total) return "0.0";
      return (((total - rank + 1) / total) * 100).toFixed(1);
    };
    
    return {
      rankings: {
        turkey: {
          rank: turkeyRank[0]?.user_rank || 1,
          total: turkeyRank[0]?.total || 1,
          percentage: calculatePercentage(turkeyRank[0]?.user_rank, turkeyRank[0]?.total)
        },
        city: {
          name: user.city || 'Bilinmiyor',
          rank: cityRank[0]?.user_rank || 1,
          total: cityRank[0]?.total || 1,
          percentage: calculatePercentage(cityRank[0]?.user_rank, cityRank[0]?.total)
        },
        district: {
          name: user.district || 'Bilinmiyor',
          rank: districtRank[0]?.user_rank || 1,
          total: districtRank[0]?.total || 1,
          percentage: calculatePercentage(districtRank[0]?.user_rank, districtRank[0]?.total)
        },
        school: {
          rank: schoolRank[0]?.user_rank || 1,
          total: schoolRank[0]?.total || 1,
          percentage: calculatePercentage(schoolRank[0]?.user_rank, schoolRank[0]?.total)
        }
      }
    };
  } catch (error) {
    console.error('getComprehensiveRanking error:', error);
    throw error;
  }
}

  /**
   * İl bazında en iyi kullanıcıları getir
   * @param {string} city - İl adı
   * @param {number} limit - Maksimum kullanıcı sayısı
   * @returns {Promise<Array>} - Kullanıcı listesi
   */
  static async getTopUsersByCity(city, limit = 10) {
    try {
      const query = `
        SELECT 
          u.id, 
          u.first_name, 
          u.last_name, 
          u.points, 
          u.user_type,
          u.class,
          s.name as school_name,
          s.district
        FROM users u
        JOIN schools s ON u.school_id = s.id
        WHERE s.city = ?
        ORDER BY u.points DESC
        LIMIT ?
      `;
      
      const [rows] = await pool.execute(query, [city, limit]);
      return rows;
    } catch (error) {
      console.error('getTopUsersByCity error:', error);
      throw error;
    }
  }

  /**
   * İlçe bazında en iyi kullanıcıları getir
   * @param {string} city - İl adı
   * @param {string} district - İlçe adı
   * @param {number} limit - Maksimum kullanıcı sayısı
   * @returns {Promise<Array>} - Kullanıcı listesi
   */
  static async getTopUsersByDistrict(city, district, limit = 10) {
    try {
      const query = `
        SELECT 
          u.id, 
          u.first_name, 
          u.last_name, 
          u.points, 
          u.user_type,
          u.class,
          s.name as school_name
        FROM users u
        JOIN schools s ON u.school_id = s.id
        WHERE s.city = ? AND s.district = ?
        ORDER BY u.points DESC
        LIMIT ?
      `;
      
      const [rows] = await pool.execute(query, [city, district, limit]);
      return rows;
    } catch (error) {
      console.error('getTopUsersByDistrict error:', error);
      throw error;
    }
  }

  /**
   * Kullanıcı tipine göre il bazında en iyi kullanıcıları getir
   * @param {string} city - İl adı
   * @param {string} userType - Kullanıcı tipi (ortaokul/lise)
   * @param {number} limit - Maksimum kullanıcı sayısı
   * @returns {Promise<Array>} - Kullanıcı listesi
   */
  static async getTopUsersByCityAndType(city, userType, limit = 10) {
    try {
      let query = `
        SELECT 
          u.id, 
          u.first_name, 
          u.last_name, 
          u.points, 
          u.user_type,
          u.class,
          s.name as school_name,
          s.district
        FROM users u
        JOIN schools s ON u.school_id = s.id
        WHERE s.city = ?
      `;
      
      const params = [city];
      
      if (userType && userType !== 'all') {
        query += ' AND u.user_type = ?';
        params.push(userType);
      }
      
      query += ' ORDER BY u.points DESC LIMIT ?';
      params.push(limit);
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('getTopUsersByCityAndType error:', error);
      throw error;
    }
  }

  /**
   * Kullanıcı tipine göre ilçe bazında en iyi kullanıcıları getir
   * @param {string} city - İl adı
   * @param {string} district - İlçe adı
   * @param {string} userType - Kullanıcı tipi (ortaokul/lise)
   * @param {number} limit - Maksimum kullanıcı sayısı
   * @returns {Promise<Array>} - Kullanıcı listesi
   */
  static async getTopUsersByDistrictAndType(city, district, userType, limit = 10) {
    try {
      let query = `
        SELECT 
          u.id, 
          u.first_name, 
          u.last_name, 
          u.points, 
          u.user_type,
          u.class,
          s.name as school_name
        FROM users u
        JOIN schools s ON u.school_id = s.id
        WHERE s.city = ? AND s.district = ?
      `;
      
      const params = [city, district];
      
      if (userType && userType !== 'all') {
        query += ' AND u.user_type = ?';
        params.push(userType);
      }
      
      query += ' ORDER BY u.points DESC LIMIT ?';
      params.push(limit);
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('getTopUsersByDistrictAndType error:', error);
      throw error;
    }
  }

/**
 * Kategoriye göre günlük soru limitini kontrol et
 * @param {number} userId - Kullanıcı ID
 * @param {number} categoryId - Kategori ID
 * @returns {Promise<Object>} - Limit bilgileri
 */
static async checkDailyLimit(userId, categoryId) {
  try {
    // Sayısal dönüşüm
    const numericUserId = parseInt(userId, 10);
    const numericCategoryId = parseInt(categoryId, 10);
    
    console.log(`Günlük limit kontrolü: userId=${numericUserId}, categoryId=${numericCategoryId}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Bugün yanıtlanan soru sayısını hesapla
    const [answeredRows] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      WHERE ua.user_id = ? 
      AND q.category = ?
      AND DATE(ua.answered_at) = CURDATE()
    `, [numericUserId, numericCategoryId]);
    
    const answeredCount = answeredRows[0].count;
    
    // Bu kategori için günlük limit
    const dailyLimit = 30; 
    
    // Kalan soru sayısı
    const remaining = Math.max(0, dailyLimit - answeredCount);
    
    return {
      category_id: categoryId,
      daily_limit: dailyLimit,
      answered_today: answeredCount,
      remaining: remaining,
      limit_reached: remaining === 0
    };
  } catch (error) {
    console.error('checkDailyLimit error:', error);
    throw error;
  }
}
  
  /**
   * Kullanıcının sıralamasını getir
   * @param {number} userId - Kullanıcı ID
   * @returns {Promise<Object>} - Sıralama bilgileri
   */
  static async getUserRanking(userId) {
    try {
      // Kullanıcı bilgilerini al
      const user = await this.findById(userId);
      if (!user) return null;
      
      // Genel sıralama
      const [generalRank] = await pool.execute(
        'SELECT COUNT(*) + 1 as rank FROM users WHERE points > (SELECT points FROM users WHERE id = ?)',
        [userId]
      );
      
      // Kullanıcı tipine göre sıralama
      const [typeRank] = await pool.execute(
        'SELECT COUNT(*) + 1 as rank FROM users WHERE user_type = ? AND points > (SELECT points FROM users WHERE id = ?)',
        [user.user_type, userId]
      );
      
      // Okul içi sıralama
      const [schoolRank] = await pool.execute(
        'SELECT COUNT(*) + 1 as rank FROM users WHERE school_id = ? AND points > (SELECT points FROM users WHERE id = ?)',
        [user.school_id, userId]
      );
      
      // Toplam kullanıcı sayısı
      const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
      
      // Kullanıcı tipine göre toplam kullanıcı sayısı
      const [totalTypeUsers] = await pool.execute(
        'SELECT COUNT(*) as count FROM users WHERE user_type = ?',
        [user.user_type]
      );
      
      // Okuldaki toplam kullanıcı sayısı
      const [totalSchoolUsers] = await pool.execute(
        'SELECT COUNT(*) as count FROM users WHERE school_id = ?',
        [user.school_id]
      );
      
      return {
        user_id: userId,
        points: user.points,
        general: {
          rank: generalRank[0].rank,
          total: totalUsers[0].count
        },
        by_type: {
          type: user.user_type,
          rank: typeRank[0].rank,
          total: totalTypeUsers[0].count
        },
        school: {
          school_id: user.school_id,
          rank: schoolRank[0].rank,
          total: totalSchoolUsers[0].count
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Aylık liderlik tablosunu getir
   * @param {string} userType - Kullanıcı tipi (ortaokul/lise/null)
   * @param {number} limit - Maksimum kullanıcı sayısı
   * @returns {Promise<Array>} - Kullanıcı listesi
   */
  static async getMonthlyLeaderboard(userType = null, limit = 10) {
    try {
      // Mevcut ayın başlangıç ve bitiş tarihleri
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      let query = `
        SELECT 
          u.id, 
          u.first_name, 
          u.last_name, 
          u.user_type,
          s.name as school_name,
          s.city,
          SUM(ua.points_earned) as monthly_points
        FROM 
          users u
        LEFT JOIN 
          schools s ON u.school_id = s.id
        INNER JOIN 
          user_answers ua ON u.id = ua.user_id
        WHERE 
          ua.answered_at BETWEEN ? AND ?
      `;
      
      const params = [firstDay, lastDay];
      
      if (userType) {
        query += ' AND u.user_type = ?';
        params.push(userType);
      }
      
      query += `
        GROUP BY 
          u.id, u.first_name, u.last_name, u.user_type, s.name, s.city
        ORDER BY 
          monthly_points DESC
        LIMIT ?
      `;
      params.push(limit);
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }


/**
 * Dashboard için toplam kullanıcı sayısını getir
 * @returns {Promise<number>} - Toplam kullanıcı sayısı
 */
static async getTotalUserCount() {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM users'
    );
    
    return rows[0].count;
  } catch (error) {
    console.error('getTotalUserCount error:', error);
    throw error;
  }
}

/**
 * Dashboard için son kayıt olan kullanıcıları getir
 * @param {number} limit - Maksimum kullanıcı sayısı
 * @returns {Promise<Array>} - Son kullanıcılar listesi
 */
static async getRecentUsers(limit = 5) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.user_type,
        u.points,
        u.register_date,
        s.name as school_name,
        s.city,
        s.district
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      ORDER BY u.register_date DESC
      LIMIT ?
    `, [limit]);
    
    return rows;
  } catch (error) {
    console.error('getRecentUsers error:', error);
    throw error;
  }
}

/**
 * Dashboard admin için tüm kullanıcıları getir (sayfalama ile)
 * @param {Object} options - Seçenekler (page, limit, search)
 * @returns {Promise<Object>} - Kullanıcılar ve sayfalama bilgisi
 */
static async getAllUsers(options = {}) {
  try {
    const { page = 1, limit = 10, search = '' } = options;
    const offset = (page - 1) * limit;
    
    // Base query
    let query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.user_type,
        u.points,
        u.register_date,
        u.last_login,
        s.name as school_name,
        s.city,
        s.district
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
    `;
    
    let countQuery = `
      SELECT COUNT(*) as count
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
    `;
    
    const params = [];
    const countParams = [];
    
    // Search filter
    if (search && search.trim()) {
      const searchCondition = `
        WHERE (
          u.first_name LIKE ? OR 
          u.last_name LIKE ? OR 
          u.email LIKE ? OR
          s.name LIKE ?
        )
      `;
      
      query += searchCondition;
      countQuery += searchCondition;
      
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Ordering and pagination
    query += ` ORDER BY u.register_date DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // Execute queries
    const [users] = await pool.execute(query, params);
    const [countResult] = await pool.execute(countQuery, countParams);
    
    const totalUsers = countResult[0].count;
    const totalPages = Math.ceil(totalUsers / limit);
    
    return {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error('getAllUsers error:', error);
    throw error;
  }
}

}




module.exports = User;