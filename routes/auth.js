const express = require('express');

const { register, login, logout, generateQR, verifyOTP, validateOTP } = require('../controllers/auth');
const { authenticate, isRegistered, canValidateOTP } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/otp/enroll', isRegistered, generateQR);
router.post('/otp/verify', isRegistered, verifyOTP);
router.post('/otp/validate', canValidateOTP, validateOTP);

module.exports = router;
