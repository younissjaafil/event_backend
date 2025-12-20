const { dbPromise } = require("../config/db");

// Get all registrations for an event
const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const [registrations] = await dbPromise.query(
      `SELECT r.*, u.name, u.email 
       FROM registrations r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.event_id = ? 
       ORDER BY r.registered_at DESC`,
      [eventId]
    );

    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

// Register user for an event
const registerUser = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId; // From authentication middleware

    // Check if event exists
    const [events] = await dbPromise.query(
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = events[0];

    // Check if user is already registered
    const [existingReg] = await dbPromise.query(
      "SELECT * FROM registrations WHERE event_id = ? AND user_id = ?",
      [eventId, userId]
    );

    if (existingReg.length > 0) {
      return res
        .status(400)
        .json({ error: "You are already registered for this event" });
    }

    // Check if event is full
    const [registrations] = await dbPromise.query(
      "SELECT COUNT(*) as count FROM registrations WHERE event_id = ?",
      [eventId]
    );

    if (registrations[0].count >= event.max_attendees) {
      return res.status(400).json({ error: "Event is full" });
    }

    // Register user
    await dbPromise.query(
      "INSERT INTO registrations (event_id, user_id) VALUES (?, ?)",
      [eventId, userId]
    );

    res.status(201).json({ message: "Successfully registered" });
  } catch (error) {
    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "You are already registered for this event" });
    }
    next(error);
  }
};

// Unregister user from an event
const unregisterUser = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId; // From authentication middleware

    // Check if registration exists
    const [registrations] = await dbPromise.query(
      "SELECT * FROM registrations WHERE event_id = ? AND user_id = ?",
      [eventId, userId]
    );

    if (registrations.length === 0) {
      return res
        .status(404)
        .json({ error: "You are not registered for this event" });
    }

    // Remove registration
    await dbPromise.query(
      "DELETE FROM registrations WHERE event_id = ? AND user_id = ?",
      [eventId, userId]
    );

    res.json({ message: "Successfully unregistered" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventRegistrations,
  registerUser,
  unregisterUser,
};

