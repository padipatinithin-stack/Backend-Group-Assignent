// ─── Bikes Routes ───────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const db = require("../db/database");

// ─── TWIST: No duplicate bike names (case-insensitive) ──────────
function checkDuplicateName(name, excludeId = null) {
  let query = "SELECT id, name FROM bikes WHERE LOWER(name) = LOWER(?)";
  const params = [name.trim()];
  if (excludeId) {
    query += " AND id != ?";
    params.push(excludeId);
  }
  return db.prepare(query).get(...params);
}

// GET all bikes   — supports ?type= query parameter for search
router.get("/", (req, res) => {
  if (req.query.type) {
    const bikes = db
      .prepare("SELECT * FROM bikes WHERE LOWER(type) = LOWER(?)")
      .all(req.query.type);
    return res.json(bikes);
  }
  const bikes = db.prepare("SELECT * FROM bikes").all();
  res.json(bikes);
});

// GET one bike by id
router.get("/:id", (req, res) => {
  const bike = db.prepare("SELECT * FROM bikes WHERE id = ?").get(req.params.id);
  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }
  res.json(bike);
});

// POST - add a new bike
router.post("/", (req, res) => {
  const { name, type } = req.body;

  // Validation
  if (!name || !type) {
    return res.status(400).json({ error: "Name and type are required" });
  }
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Name must be a non-empty string" });
  }
  if (typeof type !== "string" || type.trim() === "") {
    return res.status(400).json({ error: "Type must be a non-empty string" });
  }

  // TWIST — no duplicate names (case-insensitive)
  const duplicate = checkDuplicateName(name);
  if (duplicate) {
    return res
      .status(409)
      .json({ error: `${duplicate.name} already exists` });
  }

  const stmt = db.prepare("INSERT INTO bikes (name, type) VALUES (?, ?)");
  const result = stmt.run(name.trim(), type.trim());
  const newBike = db.prepare("SELECT * FROM bikes WHERE id = ?").get(result.lastInsertRowid);

  res.status(201).json(newBike);
});

// PUT - update a bike
router.put("/:id", (req, res) => {
  const { name, type } = req.body;

  // Check if bike exists
  const bike = db.prepare("SELECT * FROM bikes WHERE id = ?").get(req.params.id);
  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }

  // Validation
  if (!name || !type) {
    return res.status(400).json({ error: "Name and type are required" });
  }
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Name must be a non-empty string" });
  }
  if (typeof type !== "string" || type.trim() === "") {
    return res.status(400).json({ error: "Type must be a non-empty string" });
  }

  // TWIST — no duplicate names on rename (case-insensitive, exclude self)
  const duplicate = checkDuplicateName(name, req.params.id);
  if (duplicate) {
    return res
      .status(409)
      .json({ error: `${duplicate.name} already exists` });
  }

  db.prepare("UPDATE bikes SET name = ?, type = ? WHERE id = ?").run(
    name.trim(),
    type.trim(),
    req.params.id
  );
  const updated = db.prepare("SELECT * FROM bikes WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE a bike
router.delete("/:id", (req, res) => {
  const bike = db.prepare("SELECT * FROM bikes WHERE id = ?").get(req.params.id);
  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }
  db.prepare("DELETE FROM bikes WHERE id = ?").run(req.params.id);
  res.status(200).json({ message: "Bike deleted successfully" });
});

module.exports = router;
