const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
 

// Import routes
const eventsRoutes = require("./routes/events");
const registrationsRoutes = require("./routes/registrations");
const aiRoutes = require("./routes/ai");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const imagesRoutes = require("./routes/images");

const app = express();
const PORT = process.env.PORT || 5000;

 

// Middleware
// Configure CORS origins via env var to avoid "works locally, fails on live".
// Example: CORS_ORIGINS="http://localhost:3000,https://your-frontend.vercel.app"
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:3000,https://event-frontend-prod.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images
app.use('/api/images', express.static(path.join(__dirname, 'images')));

// Serve DB-stored images (falls through if static file not found)
app.use("/api/images", imagesRoutes);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/events", registrationsRoutes);
app.use("/api/ai", aiRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

 

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

