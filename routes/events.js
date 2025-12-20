const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { authenticate, authorize } = require("../middleware/auth");

// Get all events (public)
router.get("/", getAllEvents);

// Get single event (public)
router.get("/:id", getEventById);

// Create event (president and admin only)
router.post("/", authenticate, authorize('president', 'admin'), createEvent);

// Update event (president can update own, admin can update all)
router.put("/:id", authenticate, authorize('president', 'admin'), updateEvent);

// Delete event (president can delete own, admin can delete all)
router.delete("/:id", authenticate, authorize('president', 'admin'), deleteEvent);

module.exports = router;

