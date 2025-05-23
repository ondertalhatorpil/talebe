const User = require('../models/user.model');
const School = require('../models/school.model');
const { validationResult } = require('express-validator');

const { pool } = require('../config/database');


exports.getProfile = async (req, res) => {
  try {
    // req.userId middleware tarafından eklendi
    const user = await User.findById(req.userId);
    console.log('Profile request for user:', user); // DEBUG LOG
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    // Okul bilgisi artık findById'de dahil ediliyor
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Profil bilgileri alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Kullanıcı bilgilerini getir
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Email gibi hassas bilgileri kaldır
    const publicUser = { ...user };
    delete publicUser.email;
    delete publicUser.password;

    res.json({
      success: true,
      data: publicUser
    });
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı profili getirilemedi'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const userId = req.userId;
    const { first_name, last_name, gender } = req.body;
    
    // Profil bilgilerini güncelle
    const result = await User.updateProfile(userId, { first_name, last_name, gender });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı veya bilgiler güncellenemedi.'
      });
    }
    
    // Güncellenmiş profil bilgilerini döndür
    const updatedUser = await User.findById(userId);
    
    res.status(200).json({
      success: true,
      message: 'Profil bilgileri başarıyla güncellendi.',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Profil bilgileri güncellenirken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getComprehensiveRanking = async (req, res) => {
  try {
    // URL'den userId al, yoksa login olan kullanıcının id'sini kullan
    const { userId } = req.params;
    const targetUserId = userId || req.userId;
    
    const rankings = await User.getComprehensiveRanking(targetUserId);
    
    if (!rankings) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı sıralaması bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: rankings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kapsamlı sıralama alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// İl bazında en iyi kullanıcıları getir
exports.getTopUsersByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const { type, limit = 10 } = req.query;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'İl bilgisi gereklidir.'
      });
    }
    
    let topUsers;
    if (type && type !== 'all') {
      topUsers = await User.getTopUsersByCityAndType(city, type, parseInt(limit));
    } else {
      topUsers = await User.getTopUsersByCity(city, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      count: topUsers.length,
      location: { city },
      filter: { type: type || 'all' },
      users: topUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İl bazında kullanıcılar alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// İlçe bazında en iyi kullanıcıları getir
exports.getTopUsersByDistrict = async (req, res) => {
  try {
    const { city, district } = req.params;
    const { type, limit = 10 } = req.query;
    
    if (!city || !district) {
      return res.status(400).json({
        success: false,
        message: 'İl ve ilçe bilgisi gereklidir.'
      });
    }
    
    let topUsers;
    if (type && type !== 'all') {
      topUsers = await User.getTopUsersByDistrictAndType(city, district, type, parseInt(limit));
    } else {
      topUsers = await User.getTopUsersByDistrict(city, district, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      count: topUsers.length,
      location: { city, district },
      filter: { type: type || 'all' },
      users: topUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İlçe bazında kullanıcılar alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// Kullanıcının kendi ranking bilgilerini getir (farklı endpoint)
exports.getMyRankings = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Hem mevcut getUserRanking hem de yeni getComprehensiveRanking'i birleştir
    const comprehensiveRankings = await User.getComprehensiveRanking(userId);
    
    if (!comprehensiveRankings) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı sıralaması bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        rankings: comprehensiveRankings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı sıralaması alınırken bir hata oluştu.',
      error: error.message
    });
  }
};



exports.getTopUsers = async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;
    
    // Kullanıcı tipi kontrolü
    if (type && !['ortaokul', 'lise'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı tipi. "ortaokul" veya "lise" olmalıdır.'
      });
    }
    
    const topUsers = await User.getTopUsers(type, parseInt(limit));
    
    res.status(200).json({
      success: true,
      users: topUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'En yüksek puanlı kullanıcılar alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getTopUsersInSchool = async (req, res) => {
  try {
    const { schoolId, limit = 10 } = req.query;
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'Okul IDsi gereklidir.'
      });
    }
    
    // Okul var mı kontrol et
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Okul bulunamadı.'
      });
    }
    
    const topUsers = await User.getTopUsersInSchool(schoolId, parseInt(limit));
    
    res.status(200).json({
      success: true,
      school: {
        id: school.id,
        name: school.name,
        city: school.city,
        district: school.district
      },
      users: topUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Okuldaki en yüksek puanlı kullanıcılar alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.updatePoints = async (req, res) => {
  try {
    // Admin kontrolü eklenebilir
    const { userId, points } = req.body;
    
    if (!userId || points === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID ve puan değeri gereklidir.'
      });
    }
    
    // Puanı güncelle
    const result = await User.updatePoints(userId, points);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Kullanıcı puanı güncellendi. Yeni puan: ${result.points}`,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı puanı güncellenirken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getUserRanking = async (req, res) => {
  try {
    const userId = req.userId || req.params.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı IDsi gereklidir.'
      });
    }
    
    // Kullanıcının sıralamasını al
    const rankings = await User.getUserRanking(userId);
    
    if (!rankings) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      rankings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı sıralaması alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getMonthlyLeaderboard = async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;
    
    // Kullanıcı tipi kontrolü
    if (type && !['ortaokul', 'lise'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı tipi. "ortaokul" veya "lise" olmalıdır.'
      });
    }
    
    // Aylık liderlik tablosunu al
    const leaderboard = await User.getMonthlyLeaderboard(type, parseInt(limit));
    
    res.status(200).json({
      success: true,
      month: new Date().getMonth() + 1, // 1-12 arası
      year: new Date().getFullYear(),
      users: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Aylık liderlik tablosu alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.userId;
    const { limit = 10 } = req.query;
    
    console.log('🔍 getRecentActivity - Target userId:', targetUserId); // DEBUG
    
    const activities = await User.getRecentActivity(targetUserId, parseInt(limit));
    console.log('📋 getRecentActivity - Raw result:', activities); // DEBUG
    
    const response = {
      success: true,
      data: {
        activities: activities || []
      }
    };
    
    console.log('📤 getRecentActivity - Response data:', response.data); // DEBUG
    
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ getRecentActivity error:', error);
    res.status(500).json({
      success: false,
      message: 'Son aktiviteler alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getCategoryPerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.userId;
    
    console.log('🔎 DEBUG: getCategoryPerformance - Target userId:', targetUserId);
    
    // Performans verilerini User modeli üzerinden getir
    const performance = await User.getCategoryPerformance(targetUserId);
    console.log('📈 DEBUG: getCategoryPerformance - Raw result:', performance);
    
    // Kategori isimlerini almak için categories tablosundan çekelim
    const [categories] = await pool.execute('SELECT id, name FROM categories');
    const categoryMap = {};
    
    // Kategori ID -> İsim eşleştirme map'i oluşturalım
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });
    
    console.log('🔍 DEBUG: Kategori map:', categoryMap);
    
    // Performans verilerine kategori isimlerini ekleyelim
    const enhancedPerformance = performance.map(perf => {
      // Eğer kategori ID'si numarik ise ve kategori map'inde varsa ismi ekle
      if (perf.category_name && !isNaN(perf.category_name) && categoryMap[perf.category_name]) {
        console.log(`🔄 DEBUG: Kategori dönüştürme: ${perf.category_name} -> ${categoryMap[perf.category_name]}`);
        perf.category_name = categoryMap[perf.category_name];
      }
      return perf;
    });
    
    // Response için hazırla
    const response = {
      success: true,
      data: {
        categoryPerformance: enhancedPerformance || []
      }
    };
    
    console.log('📤 DEBUG: Final response data:', response.data);
    
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ getCategoryPerformance error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori performansı alınırken bir hata oluştu.',
      error: error.message
    });
  }
};



exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.userId;
    
    console.log('🔍 getUserStats - Target userId:', targetUserId); // DEBUG
    
    const stats = await User.getUserStats(targetUserId);
    console.log('📊 getUserStats - Raw result:', stats); // DEBUG
    
    const response = {
      success: true,
      data: {
        totalPoints: stats.points || 0,
        totalQuestions: stats.total_questions || 0,
        correctAnswers: stats.correct_answers || 0,
        averageScore: stats.average_score || 0,
        totalQuizzes: stats.total_quizzes || 0,
        averageTime: stats.average_time || 0
      }
    };
    
    console.log('📤 getUserStats - Response data:', response.data); // DEBUG
    
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ getUserStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı istatistikleri alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// Dashboard için kullanıcı sayısı ve son kullanıcılar
exports.getUserCount = async (req, res) => {
  try {
    // Toplam kullanıcı sayısını al
    const totalUsers = await User.getTotalUserCount();
    
    // Son 5 kullanıcıyı al
    const recentUsers = await User.getRecentUsers(5);
    
    res.status(200).json({
      success: true,
      data: {
        count: totalUsers,
        users: recentUsers
      }
    });
  } catch (error) {
    console.error('getUserCount error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı sayısı alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// Dashboard için tüm kullanıcıları listele (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const users = await User.getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar alınırken bir hata oluştu.',
      error: error.message
    });
  }
};


// User modelinde ekstra fonksiyonlar eklenmeli:
// - updateProfile
// - getUserStats
// - getTopUsersInSchool
// - getUserRanking
// - getMonthlyLeaderboard