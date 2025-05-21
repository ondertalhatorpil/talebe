const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const {  makeAdmin } = require('../controllers/auth.controller');

const { registerValidator, loginValidator } = require('../utils/validators');

// Kayıt ol
router.post('/register', registerValidator, register);

// Giriş yap
router.post('/login', loginValidator, login);
router.post('/make-admin', makeAdmin);


module.exports = router;