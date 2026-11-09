// ─── Rentals Routes ─────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET all rentals
router.get("/", (req, res) => {
  const rentals = db.prepare("SELECT * FROM rentals").all();
  res.json(rentals);
});

// GET one rental by id
router.get("/:id", (req, res) => {
  const rental = db.prepare("SELECT * FROM rentals WHERE id = ?").get(req.params.id);
  if (!rental) {
    return res.status(404).json({ error: "Rental not found" });
  }
  res.json(rental);
});

// POST - add a new rental
router.post("/", (req, res) => {
  const { rider_id, bike_id } = req.body;

  // Validation
  if (!rider_id || !bike_id) {
    return res.status(400).json({ error: "rider_id and bike_id are required" });
  }

  // Check rider exists
  const rider = db.prepare("SELECT id FROM riders WHERE id = ?").get(rider_id);
  if (!rider) {
    return res.status(404).json({ error: "Rider not found" });
  }

  // Check bike exists
  const bike = db.prepare("SELECT id FROM bikes WHERE id = ?").get(bike_id);
  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }

  const stmt = db.prepare(
    "INSERT INTO rentals (rider_id, bike_id) VALUES (?, ?)"
  );
  const result = stmt.run(rider_id, bike_id);
  const newRental = db
    .prepare("SELECT * FROM rentals WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(newRental);
});

// PUT - update a rental (e.g. mark as returned)
router.put("/:id", (req, res) => {
  const { rider_id, bike_id, returned_at } = req.body;

  const rental = db.prepare("SELECT * FROM rentals WHERE id = ?").get(req.params.id);
  if (!rental) {
    return res.status(404).json({ error: "Rental not found" });
  }

  // Validation
  if (!rider_id || !bike_id) {
    return res.status(400).json({ error: "rider_id and bike_id are required" });
  }

  // Check rider exists
  const rider = db.prepare("SELECT id FROM riders WHERE id = ?").get(rider_id);
  if (!rider) {
    return res.status(404).json({ error: "Rider not found" });
  }

  // Check bike exists
  const bike = db.prepare("SELECT id FROM bikes WHERE id = ?").get(bike_id);
  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }

  db.prepare(
    "UPDATE rentals SET rider_id = ?, bike_id = ?, returned_at = ? WHERE id = ?"
  ).run(rider_id, bike_id, returned_at || null, req.params.id);

  const updated = db.prepare("SELECT * FROM rentals WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE a rental
router.delete("/:id", (req, res) => {
  const rental = db.prepare("SELECT * FROM rentals WHERE id = ?").get(req.params.id);
  if (!rental) {
    return res.status(404).json({ error: "Rental not found" });
  }
  db.prepare("DELETE FROM rentals WHERE id = ?").run(req.params.id);
  res.status(200).json({ message: "Rental deleted successfully" });
});

// ─── JOIN Endpoint: rentals with rider name and bike name ───────
router.get("/details/all", (req, res) => {
  const details = db
    .prepare(
      `SELECT
         rentals.id        AS rental_id,
         riders.name       AS rider_name,
         bikes.name        AS bike_name,
         rentals.rented_at,
         rentals.returned_at
       FROM rentals
       JOIN riders ON rentals.rider_id = riders.id
       JOIN bikes  ON rentals.bike_id  = bikes.id`
    )
    .all();
  res.json(details);
});

module.exports = router;
