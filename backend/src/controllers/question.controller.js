// src/controllers/question.controller.js
const Question = require('../models/question.model');
const { validationResult } = require('express-validator');

// Yeni soru ekle
exports.createQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const newQuestion = await Question.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Soru başarıyla oluşturuldu.',
      question: newQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Soru oluşturulurken bir hata oluştu.',
      error: error.message
    });
  }
};

// Soruları listele (filtreli)
exports.getQuestions = async (req, res) => {
  try {
    const { user_type, category, difficulty, limit = 10, offset = 0 } = req.query;
    
    const filters = {};
    if (user_type) filters.user_type = user_type;
    if (category) filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    
    const questions = await Question.getQuestions(filters, parseInt(limit), parseInt(offset));
    
    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sorular alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// ID'ye göre soru getir
exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findByIdWithAnswers(id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Soru bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Soru alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// Soruyu güncelle
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const updatedQuestion = await Question.update(id, req.body);
    
    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Soru bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Soru başarıyla güncellendi.',
      question: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Soru güncellenirken bir hata oluştu.',
      error: error.message
    });
  }
};

// Soruyu sil
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Soru silme işlemi başlatıldı: ID=${id}`);
    
    const isDeleted = await Question.delete(id);
    
    if (!isDeleted) {
      console.log(`Soru bulunamadı: ID=${id}`);
      return res.status(404).json({
        success: false,
        message: 'Soru bulunamadı.'
      });
    }
    
    console.log(`Soru başarıyla silindi: ID=${id}`);
    res.status(200).json({
      success: true,
      message: 'Soru başarıyla silindi.'
    });
  } catch (error) {
    console.error('Soru silme hatası:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Soru silinirken bir hata oluştu.',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Kategorileri listele
exports.getCategories = async (req, res) => {
  try {
    const categories = await Question.getCategories();
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategoriler alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// Soru cevapla
exports.answerQuestion = async (req, res) => {
  try {
    const userId = req.userId;
    const { questionId, answerId } = req.body;
    
    if (!questionId || !answerId) {
      return res.status(400).json({
        success: false,
        message: 'Soru ID ve cevap ID gereklidir.'
      });
    }
    
    const result = await Question.answerQuestion(userId, questionId, answerId);
    
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