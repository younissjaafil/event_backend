const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// All routes are public now
router.get('/statistics', adminController.getStatistics);
router.get('/users', adminController.getAllUsers);
router.get('/events', adminController.getAllEventsWithCreator);

module.exports = router;
