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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images
app.use('/api/images', express.static(path.join(__dirname, 'images')));

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

