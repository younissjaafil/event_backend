const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// All routes are public now
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);

module.exports = router;
