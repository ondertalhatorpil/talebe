// src/controllers/category.controller.js
const Category = require('../models/category.model');
const { validationResult } = require('express-validator');

// Yeni kategori oluştur
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const newCategory = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Kategori başarıyla oluşturuldu.',
      category: newCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori oluşturulurken bir hata oluştu.',
      error: error.message
    });
  }
};

// Tüm kategorileri listele
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    
    res.status(200).json({
      success: true,
      count: categories.length,
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

// ID'ye göre kategori getir
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// Kategori güncelle
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const updatedCategory = await Category.update(id, req.body);
    
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Kategori başarıyla güncellendi.',
      category: updatedCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori güncellenirken bir hata oluştu.',
      error: error.message
    });
  }
};

// Kategori sil
// Kategori sil
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Kategori silme işlemi başlatıldı: ID=${id}`);
    
    const isDeleted = await Category.delete(id);
    
    if (!isDeleted) {
      console.log(`Kategori bulunamadı: ID=${id}`);
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı.'
      });
    }
    
    console.log(`Kategori başarıyla silindi: ID=${id}`);
    res.status(200).json({
      success: true,
      message: 'Kategori başarıyla silindi.'
    });
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Kategori silinirken bir hata oluştu.',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};