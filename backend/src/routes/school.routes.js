const express = require('express');
const router = express.Router();
const { 
  getAllSchools, 
  getSchoolsByCity,
  getSchoolsByDistrict,
  getSchoolById, 
  getTopSchools, 
  getSchoolStudents,
  getUniqueCities,
  getUniqueDistricts,
  importSchools,
  uploadMiddleware,
  getTopSchoolsByDistrict,
  getSchoolRankings,
  getLocationStats
} = require('../controllers/school.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Tüm okulları getir
router.get('/', getAllSchools);

// Benzersiz şehirleri getir
router.get('/cities', getUniqueCities);

// Şehirdeki benzersiz ilçeleri getir
router.get('/districts/:city', getUniqueDistricts);

// Şehire göre okulları getir
router.get('/city/:city', getSchoolsByCity);

// İlçeye göre okulları getir
router.get('/city/:city/district/:district', getSchoolsByDistrict);

// En iyi okulları getir
router.get('/top', getTopSchools);

// ID'ye göre okul getir
router.get('/:id', getSchoolById);

// Okul öğrencilerini getir
router.get('/:id/students', getSchoolStudents);

// Excel dosyasından okulları içe aktar (sadece admin)
router.post('/import', authMiddleware, uploadMiddleware, importSchools);

// İlçe bazında en iyi okulları getir  
router.get('/rankings/city/:city/district/:district', getTopSchoolsByDistrict);

// Okul sıralamasını getir
router.get('/rankings/:id', getSchoolRankings);

// İl istatistikleri
router.get('/stats/city/:city', getLocationStats);

// İlçe istatistikleri
router.get('/stats/city/:city/district/:district', getLocationStats);


module.exports = router;