const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Admin only routes
router.get('/statistics', authenticate, authorize('admin'), adminController.getStatistics);
router.get('/users', authenticate, authorize('admin'), adminController.getAllUsers);
router.get('/events', authenticate, authorize('admin'), adminController.getAllEventsWithCreator);

module.exports = router;
