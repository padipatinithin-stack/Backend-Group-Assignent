// ─── Riders Routes ──────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET all riders
router.get("/", (req, res) => {
  const riders = db.prepare("SELECT * FROM riders").all();
  res.json(riders);
});

// GET one rider by id
router.get("/:id", (req, res) => {
  const rider = db.prepare("SELECT * FROM riders WHERE id = ?").get(req.params.id);
  if (!rider) {
    return res.status(404).json({ error: "Rider not found" });
  }
  res.json(rider);
});

// POST - add a new rider
router.post("/", (req, res) => {
  const { name, email } = req.body;

  // Validation
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Name must be a non-empty string" });
  }
  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email is required" });
  }

  // Check for duplicate email
  const existing = db
    .prepare("SELECT id FROM riders WHERE LOWER(email) = LOWER(?)")
    .get(email.trim());
  if (existing) {
    return res.status(409).json({ error: "A rider with this email already exists" });
  }

  const stmt = db.prepare("INSERT INTO riders (name, email) VALUES (?, ?)");
  const result = stmt.run(name.trim(), email.trim());
  const newRider = db.prepare("SELECT * FROM riders WHERE id = ?").get(result.lastInsertRowid);

  res.status(201).json(newRider);
});

// PUT - update a rider
router.put("/:id", (req, res) => {
  const { name, email } = req.body;

  // Check if rider exists
  const rider = db.prepare("SELECT * FROM riders WHERE id = ?").get(req.params.id);
  if (!rider) {
    return res.status(404).json({ error: "Rider not found" });
  }

  // Validation
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Name must be a non-empty string" });
  }
  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email is required" });
  }

  // Check for duplicate email (exclude current rider)
  const existing = db
    .prepare("SELECT id FROM riders WHERE LOWER(email) = LOWER(?) AND id != ?")
    .get(email.trim(), req.params.id);
  if (existing) {
    return res.status(409).json({ error: "A rider with this email already exists" });
  }

  db.prepare("UPDATE riders SET name = ?, email = ? WHERE id = ?").run(
    name.trim(),
    email.trim(),
    req.params.id
  );
  const updated = db.prepare("SELECT * FROM riders WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE a rider
router.delete("/:id", (req, res) => {
  const rider = db.prepare("SELECT * FROM riders WHERE id = ?").get(req.params.id);
  if (!rider) {
    return res.status(404).json({ error: "Rider not found" });
  }
  db.prepare("DELETE FROM riders WHERE id = ?").run(req.params.id);
  res.status(200).json({ message: "Rider deleted successfully" });
});

module.exports = router;
