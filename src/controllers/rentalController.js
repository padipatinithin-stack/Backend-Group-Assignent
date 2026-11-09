const db = require('../config/database');

// GET all rentals
exports.getAllRentals = (req, res, next) => {
  try {
    const rentals = db.prepare('SELECT * FROM rentals').all();
    return res.status(200).json({ status: 'success', count: rentals.length, data: rentals });
  } catch (error) {
    next(error);
  }
};

// GET JOIN endpoint: rentals with rider name and bike name
exports.getRentalDetails = (req, res, next) => {
  try {
    const query = `
      SELECT
        rentals.id          AS rental_id,
        riders.id           AS rider_id,
        riders.name         AS rider_name,
        riders.email        AS rider_email,
        bikes.id            AS bike_id,
        bikes.name          AS bike_name,
        bikes.type          AS bike_type,
        rentals.rented_at,
        rentals.returned_at
      FROM rentals
      JOIN riders ON rentals.rider_id = riders.id
      JOIN bikes  ON rentals.bike_id  = bikes.id
      ORDER BY rentals.id DESC
    `;
    const details = db.prepare(query).all();
    return res.status(200).json({ status: 'success', count: details.length, data: details });
  } catch (error) {
    next(error);
  }
};

// GET rental by ID
exports.getRentalById = (req, res, next) => {
  try {
    const rental = db.prepare('SELECT * FROM rentals WHERE id = ?').get(req.params.id);
    if (!rental) {
      return res.status(404).json({ error: `Rental with ID ${req.params.id} not found` });
    }
    return res.status(200).json({ status: 'success', data: rental });
  } catch (error) {
    next(error);
  }
};

// CREATE new rental
exports.createRental = (req, res, next) => {
  try {
    const { rider_id, bike_id } = req.body;
    const stmt = db.prepare('INSERT INTO rentals (rider_id, bike_id) VALUES (?, ?)');
    const result = stmt.run(rider_id, bike_id);
    const newRental = db.prepare('SELECT * FROM rentals WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ status: 'success', message: 'Rental created successfully', data: newRental });
  } catch (error) {
    next(error);
  }
};

// UPDATE rental by ID (e.g. mark returned)
exports.updateRental = (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM rentals WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: `Rental with ID ${req.params.id} not found` });
    }

    const rider_id = req.body.rider_id !== undefined ? req.body.rider_id : existing.rider_id;
    const bike_id = req.body.bike_id !== undefined ? req.body.bike_id : existing.bike_id;
    const returned_at = req.body.returned_at !== undefined ? req.body.returned_at : existing.returned_at;

    db.prepare('UPDATE rentals SET rider_id = ?, bike_id = ?, returned_at = ? WHERE id = ?').run(
      rider_id,
      bike_id,
      returned_at,
      req.params.id
    );
    const updated = db.prepare('SELECT * FROM rentals WHERE id = ?').get(req.params.id);
    return res.status(200).json({ status: 'success', message: 'Rental updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE rental by ID
exports.deleteRental = (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM rentals WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: `Rental with ID ${req.params.id} not found` });
    }

    db.prepare('DELETE FROM rentals WHERE id = ?').run(req.params.id);
    return res.status(200).json({ status: 'success', message: `Rental with ID ${req.params.id} deleted successfully` });
  } catch (error) {
    next(error);
  }
};
