const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { testConnection, initDatabase } = require('./config/database');
const { corsOptions } = require('./config/server');

// Routes import
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const schoolRoutes = require('./routes/school.routes');
const questionRoutes = require('./routes/question.routes');
const categoryRoutes = require('./routes/category.routes');
const quizRoutes = require('./routes/quiz.routes');
const jokerRoutes = require('./routes/joker.routes');

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar için klasör
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/jokers', jokerRoutes);

// Ana route
app.get('/', (req, res) => {
  res.json({
    message: 'Talebe API çalışıyor!',
    version: '1.0.0'
  });
});

// 404 hatası
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Sayfa bulunamadı'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Sunucu hatası',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Veritabanı bağlantısını ve tabloları oluştur
(async () => {
  const isConnected = await testConnection();
  if (isConnected) {
    await initDatabase();
  }
})();

module.exports = app;