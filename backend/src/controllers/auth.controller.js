const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { validationResult } = require('express-validator');

// JWT Token oluştur
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    // Email adresi kayıtlı mı kontrol et
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kayıtlı.'
      });
    }
    
    // Yeni kullanıcı oluştur
    const newUser = await User.create(req.body);
    
    // JWT token oluştur
    const token = generateToken(newUser.id);
    
    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı!',
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu.',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    // Şifreyi kontrol et
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Hatalı şifre.'
      });
    }
    
    // Son giriş zamanını güncelle
    await User.updateLastLogin(user.id);
    
    // JWT token oluştur
    const token = generateToken(user.id);
    
    // Şifreyi yanıtta gösterme
    const { password: _, ...userData } = user;
    
    res.status(200).json({
      success: true,
      message: 'Giriş başarılı!',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu.',
      error: error.message
    });
  }
};


// src/controllers/auth.controller.js içine ekleyin
exports.makeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID gereklidir.'
      });
    }
    
    const [result] = await pool.execute(
      'UPDATE users SET is_admin = TRUE WHERE id = ?',
      [userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Kullanıcı admin yapıldı.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Admin yapma işlemi sırasında bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    // Middleware'den gelen userId
    const userId = req.userId;
    
    // Kullanıcı bilgilerini al
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Kullanıcı bilgileri alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;
    
    // Kullanıcıyı bul (şifre dahil)
    const [rows] = await User.pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    const user = rows[0];
    
    // Mevcut şifreyi kontrol et
    const isPasswordValid = await User.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mevcut şifre hatalı.'
      });
    }
    
    // Yeni şifreyi hashle
    const hashedPassword = await User.hashPassword(newPassword);
    
    // Şifreyi güncelle
    await User.pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla değiştirildi.'
    });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre değiştirilirken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.logout = (req, res) => {
  // JWT tabanlı kimlik doğrulama kullandığımız için backend'de logout işlemi yok
  // Frontend tarafında token'ı silmek yeterli olacaktır
  res.status(200).json({
    success: true,
    message: 'Başarıyla çıkış yapıldı.'
  });
};