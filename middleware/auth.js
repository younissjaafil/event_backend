const { dbPromise } = require('../config/db');

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Extract user ID from simple token (format: user_123)
    const userId = token.replace('user_', '');

    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user exists
    const [users] = await dbPromise.query(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user info to request
    req.userId = users[0].id;
    req.userRole = users[0].role;
    req.user = users[0];

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};
