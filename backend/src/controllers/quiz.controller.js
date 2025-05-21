// src/controllers/quiz.controller.js
const Quiz = require('../models/quiz.model');
const User = require('../models/user.model');

// Kategoriye göre quiz oluştur
exports.createQuizByCategory = async (req, res) => {
  try {
    console.log('Quiz creation started', { userId: req.userId, body: req.body }); // DEBUG LOG
    const userId = req.userId;
    const { categoryId, questionCount = 10 } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Kategori ID gereklidir.'
      });
    }
    
    const quiz = await Quiz.createQuizByCategory(userId, categoryId, questionCount);
    
    res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Quiz creation error:', error); // DEBUG LOG
    res.status(500).json({
      success: false,
      message: 'Quiz oluşturulurken bir hata oluştu.',
      error: error.message
    });
  }
};

// Soruyu cevapla
exports.answerQuestion = async (req, res) => {
  try {
    const userId = req.userId;
    const { questionId, answerId, responseTime } = req.body;
    
    if (!questionId || !answerId) {
      return res.status(400).json({
        success: false,
        message: 'Soru ID ve cevap ID gereklidir.'
      });
    }
    
    const result = await Quiz.answerQuestion(userId, questionId, answerId, responseTime);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cevap kaydedilirken bir hata oluştu.',
      error: error.message
    });
  }
};

// Kullanıcının günlük soru limitini kontrol et
exports.checkDailyLimit = async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryId } = req.params;
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Kategori ID gereklidir.'
      });
    }
    
    const limitInfo = await User.checkDailyLimit(userId, categoryId);
    
    res.status(200).json({
      success: true,
      ...limitInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Limit kontrolü sırasında bir hata oluştu.',
      error: error.message
    });
  }
};