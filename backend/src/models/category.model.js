// src/models/category.model.js
const { pool } = require('../config/database');

class Category {
  // Yeni kategori oluştur
  static async create(categoryData) {
    try {
      const { name, description } = categoryData;
      
      const [result] = await pool.execute(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description]
      );
      
      if (result.insertId) {
        return this.findById(result.insertId);
      }
      
      throw new Error('Kategori oluşturulamadı');
    } catch (error) {
      throw error;
    }
  }
  
  // ID'ye göre kategori bul
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Tüm kategorileri listele
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Kategoriyi güncelle
  static async update(id, categoryData) {
    try {
      const { name, description } = categoryData;
      
      const [result] = await pool.execute(
        'UPDATE categories SET name = ?, description = ? WHERE id = ?',
        [name, description, id]
      );
      
      if (result.affectedRows > 0) {
        return this.findById(id);
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  }
  
 /**
 * Kategoriyi sil (tüm ilişkili kayıtlarla birlikte)
 * @param {number} id - Kategori ID
 * @returns {Promise<boolean>} - Başarılı mı?
 */
static async delete(id) {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 1. daily_jokers tablosundaki kayıtları sil
      await connection.execute('DELETE FROM daily_jokers WHERE category_id = ?', [id]);
      
      // 2. joker_usage_log tablosundaki kayıtları sil (questions üzerinden)
      await connection.execute(`
        DELETE jul FROM joker_usage_log jul 
        INNER JOIN questions q ON jul.question_id = q.id 
        WHERE q.category = ?
      `, [id]);
      
      // 3. user_answers tablosundaki kayıtları sil (questions üzerinden)
      await connection.execute(`
        DELETE ua FROM user_answers ua 
        INNER JOIN questions q ON ua.question_id = q.id 
        WHERE q.category = ?
      `, [id]);
      
      // 4. answers tablosundaki kayıtları sil (questions üzerinden)
      await connection.execute(`
        DELETE a FROM answers a 
        INNER JOIN questions q ON a.question_id = q.id 
        WHERE q.category = ?
      `, [id]);
      
      // 5. questions tablosundaki kayıtları sil
      await connection.execute('DELETE FROM questions WHERE category = ?', [id]);
      
      // 6. Son olarak kategoriyi sil
      const [result] = await connection.execute('DELETE FROM categories WHERE id = ?', [id]);
      
      await connection.commit();
      connection.release();
      
      console.log(`Kategori ve tüm ilişkili kayıtlar silindi: ID=${id}`);
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
}

module.exports = Category;