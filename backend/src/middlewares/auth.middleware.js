const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/user.model');

exports.authMiddleware = async (req, res, next) => {
  try {
    // Authorization header'ı kontrol et
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Erişim yetkisi yok. Lütfen giriş yapın.'
      });
    }
    
    // Token'ı al
    const token = authHeader.split(' ')[1];
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Bu token ile ilişkili kullanıcı bulunamadı.'
      });
    }
    
    // Kullanıcı ID'sini request'e ekle
    req.userId = user.id;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token.',
      error: error.message
    });
  }
};