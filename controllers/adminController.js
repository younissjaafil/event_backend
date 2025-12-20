const db = require('../config/db');

// Get dashboard statistics
exports.getStatistics = async (req, res) => {
  try {
    // Get total events
    const [eventCount] = await db.promise().query(
      'SELECT COUNT(*) as total FROM events'
    );

    // Get total users by role
    const [usersByRole] = await db.promise().query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    // Get total registrations
    const [registrationCount] = await db.promise().query(
      'SELECT COUNT(*) as total FROM registrations'
    );

    // Get upcoming events count
    const [upcomingEvents] = await db.promise().query(
      'SELECT COUNT(*) as total FROM events WHERE date >= CURDATE()'
    );

    res.json({
      totalEvents: eventCount[0].total,
      totalRegistrations: registrationCount[0].total,
      upcomingEvents: upcomingEvents[0].total,
      usersByRole: usersByRole.reduce((acc, row) => {
        acc[row.role] = row.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// Get all events with creator info
exports.getAllEventsWithCreator = async (req, res) => {
  try {
    const [events] = await db.promise().query(
      `SELECT e.*, u.name as creator_name, u.email as creator_email,
       (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as registration_count
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.created_at DESC`
    );

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
};
