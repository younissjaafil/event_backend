const express = require("express");
const router = express.Router();
const { generateDescription, generateImage } = require("../controllers/aiController");

// All routes are public now
router.post("/generate-description", generateDescription);
router.post("/generate-image", generateImage);

module.exports = router;

