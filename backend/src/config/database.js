const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Veritabanı bağlantısını test et
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL veritabanına bağlantı başarılı.');
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL bağlantı hatası:', error);
    return false;
  }
}

// Veritabanı tablolarını oluştur
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Schools tablosu oluştur (school_type olmadan)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(50) NOT NULL,
        district VARCHAR(50) NOT NULL,
        website VARCHAR(255),
        info_link VARCHAR(255),
        map_link VARCHAR(255),
        total_points INT DEFAULT 0,
        total_students INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Users tablosu oluştur
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        birth_date DATE NOT NULL,
        user_type ENUM('ortaokul', 'lise') NOT NULL,
        school_id INT,
        class VARCHAR(2) NOT NULL,
        gender ENUM('erkek', 'kadin', 'belirtilmedi') DEFAULT 'belirtilmedi',
        points INT DEFAULT 0,
        register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
      )
    `);
    
    // Questions tablosu oluştur
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_text TEXT NOT NULL,
        user_type ENUM('ortaokul', 'lise', 'both') NOT NULL,
        category VARCHAR(50) NOT NULL,
        difficulty ENUM('kolay', 'orta', 'zor') NOT NULL,
        points INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Answers tablosu oluştur
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL,
        answer_text VARCHAR(255) NOT NULL,
        is_correct BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);
    
    // User_answers tablosu oluştur (kullanıcıların verdiği cevaplar)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        question_id INT NOT NULL,
        answer_id INT NOT NULL,
        is_correct BOOLEAN NOT NULL,
        points_earned INT NOT NULL,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Veritabanı tabloları başarıyla oluşturuldu.');
    connection.release();
  } catch (error) {
    console.error('Veritabanı tabloları oluşturulurken hata:', error);
  }
}

module.exports = {
  pool,
  testConnection,
  initDatabase
};