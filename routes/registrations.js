const express = require("express");
const router = express.Router();
const {
  getEventRegistrations,
  registerUser,
  unregisterUser,
} = require("../controllers/registrationController");

// All routes are public now
router.get("/:eventId/registrations", getEventRegistrations);
router.post("/:eventId/register", registerUser);
router.delete("/:eventId/unregister", unregisterUser);

module.exports = router;

