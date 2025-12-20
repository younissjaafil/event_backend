const { dbPromise } = require("../config/db");

// Get all events with registration count
const getAllEvents = async (req, res, next) => {
  try {
    const [events] = await dbPromise.query(
      `SELECT e.*, 
       COUNT(r.id) as registered_count,
       u.name as creator_name
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id
       LEFT JOIN users u ON e.created_by = u.id
       GROUP BY e.id
       ORDER BY e.date ASC`
    );

    // Get registrations for each event
    for (let event of events) {
      const [registrations] = await dbPromise.query(
        `SELECT u.id, u.name, u.email 
         FROM registrations r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.event_id = ?`,
        [event.id]
      );
      event.registeredUsers = registrations;
    }

    res.json(events);
  } catch (error) {
    next(error);
  }
};

// Get single event by ID
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [events] = await dbPromise.query(
      `SELECT e.*, u.name as creator_name 
       FROM events e 
       LEFT JOIN users u ON e.created_by = u.id 
       WHERE e.id = ?`,
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = events[0];

    // Get registrations for this event
    const [registrations] = await dbPromise.query(
      `SELECT u.id, u.name, u.email 
       FROM registrations r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.event_id = ?`,
      [id]
    );
    event.registeredUsers = registrations;

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Create new event
const createEvent = async (req, res, next) => {
  try {
    const { title, date, location, description, image, imagePath, maxAttendees, userId } =
      req.body;

    if (!title || !date || !location) {
      return res
        .status(400)
        .json({ error: "Title, date, and location are required" });
    }

    // Use userId from request body
    const createdBy = userId || null;

    const [result] = await dbPromise.query(
      `INSERT INTO events (title, date, location, description, image, image_path, max_attendees, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        date,
        location,
        description || null,
        image || null,
        imagePath || null,
        maxAttendees || 50,
        createdBy,
      ]
    );

    const [newEvent] = await dbPromise.query(
      `SELECT e.*, u.name as creator_name 
       FROM events e 
       LEFT JOIN users u ON e.created_by = u.id 
       WHERE e.id = ?`,
      [result.insertId]
    );

    newEvent[0].registeredUsers = [];

    res.status(201).json(newEvent[0]);
  } catch (error) {
    next(error);
  }
};

// Update event
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, date, location, description, image, imagePath, maxAttendees } =
      req.body;

    // Check if event exists
    const [existingEvents] = await dbPromise.query(
      "SELECT * FROM events WHERE id = ?",
      [id]
    );

    if (existingEvents.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = existingEvents[0];

    // Authorization check: Only admin or event creator can update
    if (req.userRole === 'president' && event.created_by !== req.userId) {
      return res.status(403).json({ error: "You can only edit your own events" });
    }

    await dbPromise.query(
      `UPDATE events 
       SET title = ?, date = ?, location = ?, description = ?, image = ?, image_path = ?, max_attendees = ?
       WHERE id = ?`,
      [
        title || event.title,
        date || event.date,
        location || event.location,
        description !== undefined ? description : event.description,
        image !== undefined ? image : event.image,
        imagePath !== undefined ? imagePath : event.image_path,
        maxAttendees || event.max_attendees,
        id,
      ]
    );

    const [updatedEvent] = await dbPromise.query(
      `SELECT e.*, u.name as creator_name 
       FROM events e 
       LEFT JOIN users u ON e.created_by = u.id 
       WHERE e.id = ?`,
      [id]
    );

    // Get registrations
    const [registrations] = await dbPromise.query(
      `SELECT u.id, u.name, u.email 
       FROM registrations r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.event_id = ?`,
      [id]
    );
    updatedEvent[0].registeredUsers = registrations;

    res.json(updatedEvent[0]);
  } catch (error) {
    next(error);
  }
};

// Delete event
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const [events] = await dbPromise.query(
      "SELECT * FROM events WHERE id = ?",
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = events[0];

    // Authorization check: Only admin or event creator can delete
    if (req.userRole === 'president' && event.created_by !== req.userId) {
      return res.status(403).json({ error: "You can only delete your own events" });
    }

    await dbPromise.query("DELETE FROM events WHERE id = ?", [id]);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

