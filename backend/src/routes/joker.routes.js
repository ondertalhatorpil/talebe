// joker.routes.js
const express = require('express');
const router = express.Router();
const { 
  checkJokerStatus, 
  useFiftyPercentJoker, 
  useDoubleAnswerJoker 
} = require('../controllers/joker.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Tüm route'lar için oturum kontrolü
router.use(authMiddleware);

// Joker durumunu kontrol et
router.get('/status/:categoryId', checkJokerStatus);

// %50 jokerini kullan
router.post('/use/fifty-percent', useFiftyPercentJoker);

// Çift cevap jokerini kullan
router.post('/use/double-answer', useDoubleAnswerJoker);

module.exports = router;