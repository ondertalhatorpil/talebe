// src/routes/quiz.routes.js
const express = require('express');
const router = express.Router();
const { 
  createQuizByCategory, 
  answerQuestion, 
  checkDailyLimit 
} = require('../controllers/quiz.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Tüm route'lar için oturum kontrolü
router.use(authMiddleware);

// Kategoriye göre quiz oluştur
router.post('/category', createQuizByCategory);

// Soruyu cevapla
router.post('/answer', answerQuestion);

// Günlük limit kontrolü
router.get('/limit/:categoryId', checkDailyLimit);

module.exports = router;