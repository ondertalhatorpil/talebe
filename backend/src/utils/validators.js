const { body } = require('express-validator');


// Kayıt formu validasyonu
exports.registerValidator = [
  // Ad validasyonu
  body('first_name')
    .trim()
    .notEmpty().withMessage('Ad alanı boş olamaz')
    .isLength({ min: 2, max: 50 }).withMessage('Ad en az 2, en fazla 50 karakter olmalıdır')
    .matches(/^[a-zA-ZığüşöçİĞÜŞÖÇ\s]+$/).withMessage('Ad sadece harflerden oluşmalıdır'),
  
  // Soyad validasyonu
  body('last_name')
    .trim()
    .notEmpty().withMessage('Soyad alanı boş olamaz')
    .isLength({ min: 2, max: 50 }).withMessage('Soyad en az 2, en fazla 50 karakter olmalıdır')
    .matches(/^[a-zA-ZığüşöçİĞÜŞÖÇ\s]+$/).withMessage('Soyad sadece harflerden oluşmalıdır'),
  
  // Email validasyonu
  body('email')
    .trim()
    .notEmpty().withMessage('Email alanı boş olamaz')
    .isEmail().withMessage('Geçerli bir email adresi girin')
    .normalizeEmail(),
  
  // Şifre validasyonu
  body('password')
    .notEmpty().withMessage('Şifre alanı boş olamaz')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/).withMessage('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'),
  
  // Şifre tekrarı validasyonu
  body('password_confirm')
    .notEmpty().withMessage('Şifre tekrarı alanı boş olamaz')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Şifreler eşleşmiyor');
      }
      return true;
    }),
  
  // Doğum tarihi validasyonu
  body('birth_date')
    .notEmpty().withMessage('Doğum tarihi alanı boş olamaz')
    .isDate().withMessage('Geçerli bir tarih girin (YYYY-MM-DD)')
    .custom(value => {
      const birthDate = new Date(value);
      const now = new Date();
      
      // En az 10 yaşında olmalı
      const minAge = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
      
      // En fazla 20 yaşında olmalı (ortaokul/lise için)
      const maxAge = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());
      
      if (birthDate > minAge) {
        throw new Error('Öğrenci en az 10 yaşında olmalıdır');
      }
      
      if (birthDate < maxAge) {
        throw new Error('Öğrenci en fazla 20 yaşında olmalıdır');
      }
      
      return true;
    }),
  
  // Kullanıcı tipi validasyonu
  body('user_type')
    .notEmpty().withMessage('Öğrenci türü seçilmelidir')
    .isIn(['ortaokul', 'lise']).withMessage('Geçerli bir öğrenci türü seçin (ortaokul veya lise)'),
  
  // Okul ID validasyonu
  body('school_id')
    .notEmpty().withMessage('Okul seçilmelidir')
    .isInt({ min: 1 }).withMessage('Geçerli bir okul seçin'),
  
  
  // Cinsiyet validasyonu (isteğe bağlı)
  body('gender')
    .optional()
    .isIn(['erkek', 'kadin', 'belirtilmedi']).withMessage('Geçerli bir cinsiyet seçin')
];

// Giriş formu validasyonu
exports.loginValidator = [
  // Email validasyonu
  body('email')
    .trim()
    .notEmpty().withMessage('Email alanı boş olamaz')
    .isEmail().withMessage('Geçerli bir email adresi girin')
    .normalizeEmail(),
  
  // Şifre validasyonu
  body('password')
    .notEmpty().withMessage('Şifre alanı boş olamaz')
];



// Soru validasyonu
exports.questionValidator = [
  body('question_text')
    .notEmpty().withMessage('Soru metni boş olamaz')
    .isLength({ min: 10 }).withMessage('Soru metni en az 10 karakter olmalıdır'),
  
  body('user_type')
    .notEmpty().withMessage('Kullanıcı tipi boş olamaz')
    .isIn(['ortaokul', 'lise', 'both']).withMessage('Geçerli bir kullanıcı tipi seçin (ortaokul, lise veya both)'),
  
  body('category')
    .notEmpty().withMessage('Kategori boş olamaz'),
  
  body('difficulty')
    .notEmpty().withMessage('Zorluk seviyesi boş olamaz')
    .isIn(['kolay', 'orta', 'zor']).withMessage('Geçerli bir zorluk seviyesi seçin (kolay, orta veya zor)'),
  
  body('answers')
    .isArray({ min: 2 }).withMessage('En az 2 cevap seçeneği olmalıdır'),
  
  body('answers.*.answer_text')
    .notEmpty().withMessage('Cevap metni boş olamaz'),
  
  body('answers')
    .custom(answers => {
      const correctAnswers = answers.filter(answer => answer.is_correct);
      if (correctAnswers.length === 0) {
        throw new Error('En az bir doğru cevap olmalıdır');
      }
      return true;
    })
];