const db = require('../config/database');

// GET all riders
exports.getAllRiders = (req, res, next) => {
  try {
    const riders = db.prepare('SELECT * FROM riders').all();
    return res.status(200).json({ status: 'success', count: riders.length, data: riders });
  } catch (error) {
    next(error);
  }
};

// GET rider by ID
exports.getRiderById = (req, res, next) => {
  try {
    const rider = db.prepare('SELECT * FROM riders WHERE id = ?').get(req.params.id);
    if (!rider) {
      return res.status(404).json({ error: `Rider with ID ${req.params.id} not found` });
    }
    return res.status(200).json({ status: 'success', data: rider });
  } catch (error) {
    next(error);
  }
};

// CREATE new rider
exports.createRider = (req, res, next) => {
  try {
    const { name, email } = req.body;
    const stmt = db.prepare('INSERT INTO riders (name, email) VALUES (?, ?)');
    const result = stmt.run(name.trim(), email.trim());
    const newRider = db.prepare('SELECT * FROM riders WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ status: 'success', message: 'Rider registered successfully', data: newRider });
  } catch (error) {
    next(error);
  }
};

// UPDATE rider by ID
exports.updateRider = (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM riders WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: `Rider with ID ${req.params.id} not found` });
    }

    const name = req.body.name ? req.body.name.trim() : existing.name;
    const email = req.body.email ? req.body.email.trim() : existing.email;

    db.prepare('UPDATE riders SET name = ?, email = ? WHERE id = ?').run(name, email, req.params.id);
    const updated = db.prepare('SELECT * FROM riders WHERE id = ?').get(req.params.id);
    return res.status(200).json({ status: 'success', message: 'Rider updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE rider by ID
exports.deleteRider = (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM riders WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: `Rider with ID ${req.params.id} not found` });
    }

    db.prepare('DELETE FROM riders WHERE id = ?').run(req.params.id);
    return res.status(200).json({ status: 'success', message: `Rider with ID ${req.params.id} deleted successfully` });
  } catch (error) {
    next(error);
  }
};
