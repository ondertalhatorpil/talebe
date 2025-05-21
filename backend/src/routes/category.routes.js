// src/routes/category.routes.js
const express = require('express');
const router = express.Router();
const { 
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/category.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { adminMiddleware } = require('../middlewares/admin.middleware');

// Tüm route'lar için oturum kontrolü
router.use(authMiddleware);

// Kategori listeleme ve detay görüntüleme herkes için
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Kategori oluşturma, güncelleme ve silme sadece admin için
router.post('/', adminMiddleware, createCategory);
router.put('/:id', adminMiddleware, updateCategory);
router.delete('/:id', adminMiddleware, deleteCategory);

module.exports = router;