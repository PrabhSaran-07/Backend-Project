const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register - Public
router.post('/register', authController.register);

// POST /api/auth/login - Public
router.post('/login', authController.login);

// GET /api/auth/me - Token required
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;

