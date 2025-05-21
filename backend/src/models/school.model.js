const { pool } = require('../config/database');

class School {
  /**
   * Tüm okulları getir
   * @returns {Promise<Array>} - Okul listesi
   */
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM schools ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * İlçe bazında en yüksek puanlı okulları getir
   * @param {string} city - İl adı
   * @param {string} district - İlçe adı  
   * @param {number} limit - Maksimum okul sayısı
   * @returns {Promise<Array>} - Okul listesi
   */
  static async getTopSchoolsByDistrict(city, district, limit = 10) {
    try {
      const query = `
        SELECT 
          id,
          name,
          total_points,
          total_students,
          type,
          (SELECT COUNT(*) + 1 FROM schools s2 WHERE s2.city = ? AND s2.district = ? AND s2.total_points > schools.total_points) as district_rank
        FROM schools
        WHERE city = ? AND district = ?
        ORDER BY total_points DESC
        LIMIT ?
      `;
      
      const [rows] = await pool.execute(query, [city, district, city, district, limit]);
      return rows;
    } catch (error) {
      console.error('getTopSchoolsByDistrict error:', error);
      throw error;
    }
  }

  /**
   * Okulun şehir ve ilçe içindeki sıralamasını getir
   * @param {number} schoolId - Okul ID
   * @returns {Promise<Object>} - Okul sıralama bilgileri
   */
  static async getSchoolRankings(schoolId) {
    try {
      // Okul bilgilerini al
      const school = await this.findById(schoolId);
      if (!school) return null;

      // Türkiye geneli sıralaması
      const [turkeyRank] = await pool.execute(
        'SELECT COUNT(*) + 1 as rank FROM schools WHERE total_points > ?',
        [school.total_points]
      );

      // İl bazında sıralaması
      const [cityRank] = await pool.execute(
        'SELECT COUNT(*) + 1 as rank FROM schools WHERE city = ? AND total_points > ?',
        [school.city, school.total_points]
      );

      // İlçe bazında sıralaması
      const [districtRank] = await pool.execute(
        'SELECT COUNT(*) + 1 as rank FROM schools WHERE city = ? AND district = ? AND total_points > ?',
        [school.city, school.district, school.total_points]
      );

      // Toplam sayıları
      const [totalSchools] = await pool.execute('SELECT COUNT(*) as total FROM schools');
      const [totalCitySchools] = await pool.execute(
        'SELECT COUNT(*) as total FROM schools WHERE city = ?',
        [school.city]
      );
      const [totalDistrictSchools] = await pool.execute(
        'SELECT COUNT(*) as total FROM schools WHERE city = ? AND district = ?',
        [school.city, school.district]
      );

      return {
        school_id: schoolId,
        school_name: school.name,
        total_points: school.total_points,
        total_students: school.total_students,
        rankings: {
          turkey: {
            rank: turkeyRank[0].rank,
            total: totalSchools[0].total,
            percentage: ((totalSchools[0].total - turkeyRank[0].rank + 1) / totalSchools[0].total * 100).toFixed(1)
          },
          city: {
            name: school.city,
            rank: cityRank[0].rank,
            total: totalCitySchools[0].total,
            percentage: ((totalCitySchools[0].total - cityRank[0].rank + 1) / totalCitySchools[0].total * 100).toFixed(1)
          },
          district: {
            name: school.district,
            rank: districtRank[0].rank,
            total: totalDistrictSchools[0].total,
            percentage: ((totalDistrictSchools[0].total - districtRank[0].rank + 1) / totalDistrictSchools[0].total * 100).toFixed(1)
          }
        }
      };
    } catch (error) {
      console.error('getSchoolRankings error:', error);
      throw error;
    }
  }

  /**
   * Belirli bir il/ilçedeki okulları ve istatistiklerini getir
   * @param {string} city - İl adı
   * @param {string} district - İlçe adı (opsiyonel)
   * @returns {Promise<Object>} - İl/İlçe istatistikleri ve okul listesi
   */
  static async getLocationStats(city, district = null) {
    try {
      let query, params;
      
      if (district) {
        // İlçe statistikleri
        query = `
          SELECT 
            COUNT(*) as total_schools,
            SUM(total_students) as total_students,
            SUM(total_points) as total_points,
            AVG(total_points) as avg_points
          FROM schools 
          WHERE city = ? AND district = ?
        `;
        params = [city, district];
      } else {
        // İl statistikleri
        query = `
          SELECT 
            COUNT(*) as total_schools,
            SUM(total_students) as total_students,
            SUM(total_points) as total_points,
            AVG(total_points) as avg_points
          FROM schools 
          WHERE city = ?
        `;
        params = [city];
      }
      
      const [stats] = await pool.execute(query, params);
      
      // En iyi 3 okulu getir
      const topSchools = district 
        ? await this.getTopSchoolsByDistrict(city, district, 3)
        : await this.getTopSchoolsByCity(city, 3);
      
      return {
        location: district ? { city, district } : { city },
        statistics: stats[0],
        top_schools: topSchools
      };
    } catch (error) {
      console.error('getLocationStats error:', error);
      throw error;
    }
  }
  
  /**
   * Şehir bazında okulları getir
   * @param {string} city - Şehir adı
   * @returns {Promise<Array>} - Okul listesi
   */
  static async findByCity(city) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM schools WHERE city = ? ORDER BY name',
        [city]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  /**
 * İlçe bazında okulları getir
 * @param {string} city - Şehir adı
 * @param {string} district - İlçe adı
 * @returns {Promise<Array>} - Okul listesi
 */
static async findByDistrict(city, district) {
  try {
    // Şehir ve ilçe parametrelerini logla
    console.log('Okul arama parametreleri:', { city, district });
    
    // Veritabanından tüm okulları getir
    const [rows] = await pool.execute(
      'SELECT * FROM schools WHERE city = ? AND district = ? ORDER BY name',
      [city, district]
    );
    
    // Bulunan okulları detaylı şekilde logla
    console.log(`Bulunan okul sayısı: ${rows.length}`);
    if (rows.length > 0) {
      console.log('Bulunan okullar:');
      rows.forEach((school, index) => {
        console.log(`${index + 1}. ${school.name} (ID: ${school.id})`);
      });
    } else {
      console.log('Bu şehir ve ilçe için hiç okul bulunamadı!');
    }
    
    return rows;
  } catch (error) {
    console.error('findByDistrict metodu hatası:', error);
    throw error;
  }
}

/**
 * İlçe ve okul tipine göre okulları getir
 * @param {string} city - Şehir adı
 * @param {string} district - İlçe adı
 * @param {string} type - Okul tipi (ortaokul/lise), kullanılmayacak
 * @returns {Promise<Array>} - Okul listesi
 */
static async findByDistrictAndType(city, district, type) {
  try {
    console.log('Model parametreleri:', { city, district, type });
    
    let query = 'SELECT * FROM schools WHERE city = ? AND district = ?';
    let params = [city, district];
    
    // Tip filtrelemesi ekle
    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY name';
    console.log('SQL sorgusu:', query, params);
    
    const [rows] = await pool.execute(query, params);
    
    console.log(`Bulunan okul sayısı: ${rows.length}`);
    if (rows.length > 0) {
      console.log(`İlk 3 okul: ${rows.slice(0, 3).map(s => s.name).join(', ')}`);
    }
    
    return rows;
  } catch (error) {
    console.error('Model hatası:', error);
    throw error;
  }
}

  /**
   * ID'ye göre okul bul
   * @param {number} id - Okul ID
   * @returns {Promise<Object|null>} - Bulunan okul veya null
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM schools WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * En yüksek puanlı okulları getir
   * @param {number} limit - Maksimum okul sayısı
   * @returns {Promise<Array>} - Okul listesi
   */
  static async getTopSchools(limit = 10) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM schools ORDER BY total_points DESC LIMIT ?',
        [limit]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Şehire göre en yüksek puanlı okulları getir
   * @param {string} city - Şehir adı
   * @param {number} limit - Maksimum okul sayısı
   * @returns {Promise<Array>} - Okul listesi
   */
  static async getTopSchoolsByCity(city, limit = 10) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM schools WHERE city = ? ORDER BY total_points DESC LIMIT ?',
        [city, limit]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Okuldaki öğrencileri getir
   * @param {number} schoolId - Okul ID
   * @param {number} limit - Maksimum öğrenci sayısı
   * @param {number} offset - Başlangıç indeksi
   * @returns {Promise<Array>} - Öğrenci listesi
   */
  static async getStudents(schoolId, limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, first_name, last_name, user_type, class, points, register_date 
         FROM users 
         WHERE school_id = ? 
         ORDER BY points DESC 
         LIMIT ? OFFSET ?`,
        [schoolId, limit, offset]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Benzersiz şehirleri getir
   * @returns {Promise<Array>} - Şehir listesi
   */
  static async getUniqueCities() {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT city FROM schools ORDER BY city'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Belirli bir şehirdeki benzersiz ilçeleri getir
   * @param {string} city - Şehir adı
   * @returns {Promise<Array>} - İlçe listesi
   */
  static async getUniqueDistricts(city) {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT district FROM schools WHERE city = ? ORDER BY district',
        [city]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Okul bilgilerini güncelle
   * @param {number} schoolId - Okul ID
   * @param {Object} updateData - Güncellenecek veriler
   * @returns {Promise<boolean>} - Başarılı mı?
   */
  static async updateSchool(schoolId, updateData) {
    try {
      const { name, city, district, website, info_link, map_link } = updateData;
      
      const [result] = await pool.execute(
        `UPDATE schools 
         SET name = ?, city = ?, district = ?, website = ?, info_link = ?, map_link = ?
         WHERE id = ?`,
        [name, city, district, website, info_link, map_link, schoolId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Okul puanlarını ve öğrenci sayısını yeniden hesapla
   * @param {number} schoolId - Okul ID
   * @returns {Promise<Object>} - Güncellenmiş okul istatistikleri
   */
  static async recalculateSchoolStats(schoolId) {
    try {
      const connection = await pool.getConnection();
      
      // Okul toplam puanlarını güncelle
      await connection.execute(
        'UPDATE schools SET total_points = (SELECT COALESCE(SUM(points), 0) FROM users WHERE school_id = ?) WHERE id = ?',
        [schoolId, schoolId]
      );
      
      // Okul öğrenci sayısını güncelle
      await connection.execute(
        'UPDATE schools SET total_students = (SELECT COUNT(*) FROM users WHERE school_id = ?) WHERE id = ?',
        [schoolId, schoolId]
      );
      
      // Güncellenmiş okul bilgilerini al
      const [rows] = await connection.execute(
        'SELECT total_points, total_students FROM schools WHERE id = ?',
        [schoolId]
      );
      
      connection.release();
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Okul detaylarını ve istatistikleri getir
   * @param {number} schoolId - Okul ID
   * @returns {Promise<Object>} - Okul detayları ve istatistikleri
   */
  static async getSchoolDetails(schoolId) {
    try {
      // Okul bilgilerini al
      const school = await this.findById(schoolId);
      if (!school) return null;
      
      // Okul öğrenci dağılımı (sınıf bazında)
      const [classDistribution] = await pool.execute(
        `SELECT user_type, class, COUNT(*) as count
         FROM users
         WHERE school_id = ?
         GROUP BY user_type, class
         ORDER BY user_type, class`,
        [schoolId]
      );
      
      // Okul sıralaması
      const [schoolRank] = await pool.execute(
        'SELECT COUNT(*) + 1 as rank FROM schools WHERE total_points > (SELECT total_points FROM schools WHERE id = ?)',
        [schoolId]
      );
      
      // Şehir içi okul sıralaması
      const [cityRank] = await pool.execute(
        'SELECT COUNT(*) + 1 as rank FROM schools WHERE city = ? AND total_points > (SELECT total_points FROM schools WHERE id = ?)',
        [school.city, schoolId]
      );
      
      // Toplam okul sayısı
      const [totalSchools] = await pool.execute('SELECT COUNT(*) as count FROM schools');
      
      // Şehirdeki toplam okul sayısı
      const [totalCitySchools] = await pool.execute(
        'SELECT COUNT(*) as count FROM schools WHERE city = ?',
        [school.city]
      );
      
      return {
        ...school,
        class_distribution: classDistribution,
        rankings: {
          general: {
            rank: schoolRank[0].rank,
            total: totalSchools[0].count
          },
          city: {
            rank: cityRank[0].rank,
            total: totalCitySchools[0].count
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }
}


module.exports = School;