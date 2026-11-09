const db = require('../config/database');

/**
 * Validates Bike payload for creation and updates, and enforces the Twist:
 * "Two bikes cannot share a name, even with different capital letters.
 *  A duplicate gets 409 and the message '<Bike Name> already exists'."
 */
function validateBike(req, res, next) {
  const isPost = req.method === 'POST';
  const { name, type } = req.body;

  if (isPost) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Validation Error: "name" is required and cannot be empty.' });
    }
    if (!type || typeof type !== 'string' || type.trim() === '') {
      return res.status(400).json({ error: 'Validation Error: "type" is required and cannot be empty.' });
    }
  } else {
    // For PUT, at least one property must be provided
    if (name === undefined && type === undefined) {
      return res.status(400).json({ error: 'Validation Error: At least "name" or "type" must be provided for update.' });
    }
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ error: 'Validation Error: "name" cannot be empty.' });
    }
    if (type !== undefined && (typeof type !== 'string' || type.trim() === '')) {
      return res.status(400).json({ error: 'Validation Error: "type" cannot be empty.' });
    }
  }

  // Twist Rule Check: No duplicate names (case-insensitive)
  if (name) {
    let duplicateQuery = 'SELECT * FROM bikes WHERE LOWER(name) = LOWER(?)';
    const params = [name.trim()];

    // When updating, exclude the current bike
    if (!isPost && req.params.id) {
      duplicateQuery += ' AND id != ?';
      params.push(req.params.id);
    }

    const existingBike = db.prepare(duplicateQuery).get(...params);
    if (existingBike) {
      const msg = `${existingBike.name} already exists`;
      return res.status(409).json({ message: msg, error: msg });
    }
  }

  next();
}

/**
 * Validates Rider payload for creation and updates
 */
function validateRider(req, res, next) {
  const isPost = req.method === 'POST';
  const { name, email } = req.body;

  if (isPost) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Validation Error: "name" is required.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Validation Error: A valid "email" is required.' });
    }

    // Check duplicate email
    const existing = db.prepare('SELECT * FROM riders WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(409).json({ error: 'A rider with this email already exists.' });
    }
  } else {
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ error: 'Validation Error: "name" cannot be empty.' });
    }
    if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
      return res.status(400).json({ error: 'Validation Error: A valid "email" is required.' });
    }
    if (email) {
      const existing = db.prepare('SELECT * FROM riders WHERE LOWER(email) = LOWER(?) AND id != ?').get(email.trim(), req.params.id);
      if (existing) {
        return res.status(409).json({ error: 'A rider with this email already exists.' });
      }
    }
  }

  next();
}

/**
 * Validates Rental payload
 */
function validateRental(req, res, next) {
  const { rider_id, bike_id } = req.body;

  if (!rider_id) {
    return res.status(400).json({ error: 'Validation Error: "rider_id" is required.' });
  }
  if (!bike_id) {
    return res.status(400).json({ error: 'Validation Error: "bike_id" is required.' });
  }

  // Verify rider exists
  const rider = db.prepare('SELECT * FROM riders WHERE id = ?').get(rider_id);
  if (!rider) {
    return res.status(404).json({ error: `Rider with ID ${rider_id} does not exist.` });
  }

  // Verify bike exists
  const bike = db.prepare('SELECT * FROM bikes WHERE id = ?').get(bike_id);
  if (!bike) {
    return res.status(404).json({ error: `Bike with ID ${bike_id} does not exist.` });
  }

  next();
}

module.exports = {
  validateBike,
  validateRider,
  validateRental
};
