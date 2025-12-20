const express = require("express");
const router = express.Router();
const { generateDescription, generateImage } = require("../controllers/aiController");
const { authenticate, authorize } = require("../middleware/auth");

// Generate event description (president and admin only)
router.post("/generate-description", authenticate, authorize('president', 'admin'), generateDescription);

// Generate event image (president and admin only)
router.post("/generate-image", authenticate, authorize('president', 'admin'), generateImage);

module.exports = router;

