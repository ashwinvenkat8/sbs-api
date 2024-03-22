const express = require('express');

const { appStatus, apiStatus } = require('../controllers/status');

const router = express.Router();

router.get('/', appStatus);
router.get('/auth', apiStatus);
router.get('/transaction', apiStatus);
router.get('/user', apiStatus);

module.exports = router;
