const express = require("express");
const router = express.Router();

const { getImageById } = require("../controllers/imagesController");

router.get("/:id", getImageById);

module.exports = router;
