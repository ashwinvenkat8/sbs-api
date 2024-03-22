const express = require('express');

const { register, login, logout, generateQR, verifyOTP, validateOTP } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/otp/enroll', authenticate, generateQR);
router.post('/otp/verify', authenticate, verifyOTP);
router.post('/otp/validate', authenticate, validateOTP);

module.exports = router;
