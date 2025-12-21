const { dbPromise } = require("../config/db");

const getImageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await dbPromise.query(
      "SELECT mime_type, data FROM images WHERE id = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    const { mime_type: mimeType, data } = rows[0];

    // Conservative caching; images are immutable once stored.
    res.setHeader("Content-Type", mimeType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=86400");

    // mysql2 returns Buffer for BLOB columns.
    return res.status(200).send(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getImageById,
};
