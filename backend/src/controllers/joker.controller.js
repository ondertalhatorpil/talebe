// joker.controller.js
const Joker = require('../models/joker.model');

// Joker durumunu kontrol et
exports.checkJokerStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryId } = req.params;
    
    const status = await Joker.checkJokerStatus(userId, parseInt(categoryId));
    
    res.status(200).json({
      success: true,
      joker_status: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Joker durumu kontrol edilirken bir hata oluştu.',
      error: error.message
    });
  }
};

// %50 jokerini kullan
exports.useFiftyPercentJoker = async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryId, questionId } = req.body;
    
    const result = await Joker.useFiftyPercentJoker(userId, categoryId, questionId);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Çift cevap jokerini kullan
exports.useDoubleAnswerJoker = async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryId, questionId } = req.body;
    
    const result = await Joker.useDoubleAnswerJoker(userId, categoryId, questionId);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};