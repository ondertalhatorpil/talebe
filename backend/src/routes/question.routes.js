const express = require('express');
const router = express.Router();
const { 
  createQuestion, 
  getQuestions, 
  getQuestionById, 
  updateQuestion, 
  deleteQuestion,
  getCategories,
  answerQuestion
} = require('../controllers/question.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { adminMiddleware } = require('../middlewares/admin.middleware');

// Tüm route'lar için oturum kontrolü
router.use(authMiddleware);

// Sadece adminler soru ekleme/düzenleme/silme yapabilir
router.post('/', adminMiddleware, createQuestion);
router.put('/:id', adminMiddleware, updateQuestion);
router.delete('/:id', adminMiddleware, deleteQuestion);

// Tüm kullanıcılar soruları listeleyebilir ve detaylarını görebilir
router.get('/', getQuestions);
router.get('/categories', getCategories);
router.get('/:id', getQuestionById);

// Tüm kullanıcılar soruları cevaplayabilir
router.post('/answer', answerQuestion);

module.exports = router;