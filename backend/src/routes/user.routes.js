const express = require('express');
const router = express.Router();
// Tüm controller'ı import et
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { adminMiddleware } = require('../middlewares/admin.middleware'); // ← BU SATIRINI EKLEYİN

// Kullanıcı profili (kendi profili)
router.get('/profile', authMiddleware, userController.getProfile);

// 🆕 YENİ EKLENEN: Belirli bir kullanıcının profilini getir (herkese açık)
router.get('/profile/:userId', userController.getUserProfile);

// En iyi kullanıcılar
router.get('/top', userController.getTopUsers);

// Puan güncelle (Admin)
router.put('/points', authMiddleware, userController.updatePoints);

// Yeni eklenen endpoint'ler (kendi profilin için)
router.get('/stats', authMiddleware, userController.getUserStats);
router.get('/activity', authMiddleware, userController.getRecentActivity);
router.get('/category-performance', authMiddleware, userController.getCategoryPerformance);

// 🆕 YENİ EKLENEN: Belirli bir kullanıcının istatistiklerini getir
router.get('/stats/:userId', userController.getUserStats);
router.get('/activity/:userId', userController.getRecentActivity);
router.get('/category-performance/:userId', userController.getCategoryPerformance);

// Kullanıcının kapsamlı sıralaması (Türkiye, il, ilçe, okul)
router.get('/rankings/comprehensive', authMiddleware, userController.getComprehensiveRanking);

// 🆕 YENİ EKLENEN: Belirli bir kullanıcının kapsamlı sıralaması
router.get('/rankings/comprehensive/:userId', userController.getComprehensiveRanking);

// Kullanıcının kendi ranking bilgileri (alternatif endpoint)
router.get('/rankings/my', authMiddleware, userController.getMyRankings);

// İl bazında en iyi kullanıcılar
router.get('/rankings/city/:city', userController.getTopUsersByCity);

// İlçe bazında en iyi kullanıcılar
router.get('/rankings/city/:city/district/:district', userController.getTopUsersByDistrict);

// ✅ Dashboard için gerekli endpoint'ler (Admin yetkisi gerekli) - BU SATIRLARI EKLEYİN:
router.get('/count', authMiddleware, adminMiddleware, userController.getUserCount);
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);

module.exports = router;