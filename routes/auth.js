const express = require('express');

const { register, login, logout, generateQR, verifyOTP, validateOTP } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get("/generate-qr", authenticate, generateQR);
router.post("/validate-otp", authenticate, validateOTP);
router.post("/verify-otp", authenticate, verifyOTP);

module.exports = router;
