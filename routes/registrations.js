const express = require("express");
const router = express.Router();
const {
  getEventRegistrations,
  registerUser,
  unregisterUser,
} = require("../controllers/registrationController");
const { authenticate } = require("../middleware/auth");

// Get all registrations for an event
router.get("/:eventId/registrations", getEventRegistrations);

// Register user for an event (authenticated users only)
router.post("/:eventId/register", authenticate, registerUser);

// Unregister user from an event (authenticated users only)
router.delete("/:eventId/unregister", authenticate, unregisterUser);

module.exports = router;

