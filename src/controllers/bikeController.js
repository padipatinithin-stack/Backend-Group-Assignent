const db = require('../config/database');

// GET all bikes (supports query param search by type)
exports.getAllBikes = (req, res, next) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM bikes';
    const params = [];

    if (type) {
      query += ' WHERE LOWER(type) = LOWER(?)';
      params.push(type.trim());
    }

    const bikes = db.prepare(query).all(...params);
    return res.status(200).json({ status: 'success', count: bikes.length, data: bikes });
  } catch (error) {
    next(error);
  }
};

// GET bike by ID
exports.getBikeById = (req, res, next) => {
  try {
    const bike = db.prepare('SELECT * FROM bikes WHERE id = ?').get(req.params.id);
    if (!bike) {
      return res.status(404).json({ error: `Bike with ID ${req.params.id} not found` });
    }
    return res.status(200).json({ status: 'success', data: bike });
  } catch (error) {
    next(error);
  }
};

// CREATE new bike
exports.createBike = (req, res, next) => {
  try {
    const { name, type } = req.body;
    const stmt = db.prepare('INSERT INTO bikes (name, type) VALUES (?, ?)');
    const result = stmt.run(name.trim(), type.trim());
    const newBike = db.prepare('SELECT * FROM bikes WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ status: 'success', message: 'Bike created successfully', data: newBike });
  } catch (error) {
    next(error);
  }
};

// UPDATE bike by ID
exports.updateBike = (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM bikes WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: `Bike with ID ${req.params.id} not found` });
    }

    const name = req.body.name ? req.body.name.trim() : existing.name;
    const type = req.body.type ? req.body.type.trim() : existing.type;

    db.prepare('UPDATE bikes SET name = ?, type = ? WHERE id = ?').run(name, type, req.params.id);
    const updated = db.prepare('SELECT * FROM bikes WHERE id = ?').get(req.params.id);
    return res.status(200).json({ status: 'success', message: 'Bike updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE bike by ID
exports.deleteBike = (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM bikes WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: `Bike with ID ${req.params.id} not found` });
    }

    db.prepare('DELETE FROM bikes WHERE id = ?').run(req.params.id);
    return res.status(200).json({ status: 'success', message: `Bike with ID ${req.params.id} deleted successfully` });
  } catch (error) {
    next(error);
  }
};
