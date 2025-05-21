require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'bilgeyaris_db',
  JWT_SECRET: process.env.JWT_SECRET || 'bilgeyaris-gizli-anahtar',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d'
};