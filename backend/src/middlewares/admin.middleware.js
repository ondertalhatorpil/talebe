// src/middlewares/admin.middleware.js
const User = require('../models/user.model');

exports.adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId; // authMiddleware'den geliyor
    
    // Kullanıcı admin mi kontrol et
    const isAdmin = await User.isAdmin(userId);
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için admin yetkisi gerekiyor.'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Admin yetki kontrolü sırasında bir hata oluştu.',
      error: error.message
    });
  }
};