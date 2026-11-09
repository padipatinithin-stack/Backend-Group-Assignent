// ─── Database Setup (Built-in Node SQLite) ─────────────────────
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "..", "spincycle.db");
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// ─── Create Tables ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS riders (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT    NOT NULL,
    email TEXT    NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS bikes (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL,
    type TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rentals (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    rider_id    INTEGER NOT NULL,
    bike_id     INTEGER NOT NULL,
    rented_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    returned_at TEXT,
    FOREIGN KEY (rider_id) REFERENCES riders(id),
    FOREIGN KEY (bike_id)  REFERENCES bikes(id)
  );
`);

// ─── Seed initial data if empty ─────────────────────────────────
const riderCount = db.prepare("SELECT COUNT(*) as count FROM riders").get();

if (riderCount.count === 0) {
  const seedRiders = db.prepare(
    "INSERT OR IGNORE INTO riders (id, name, email) VALUES (?, ?, ?)"
  );
  const seedBikes = db.prepare(
    "INSERT OR IGNORE INTO bikes (id, name, type) VALUES (?, ?, ?)"
  );
  const seedRentals = db.prepare(
    "INSERT OR IGNORE INTO rentals (id, rider_id, bike_id, rented_at, returned_at) VALUES (?, ?, ?, ?, ?)"
  );

  db.exec("BEGIN TRANSACTION;");
  try {
    seedRiders.run(1, "Alice Johnson", "alice@campus.edu");
    seedRiders.run(2, "Bob Smith", "bob@campus.edu");
    seedRiders.run(3, "Charlie Brown", "charlie@campus.edu");

    seedBikes.run(1, "Bike 1", "mountain");
    seedBikes.run(2, "Bike 2", "road");
    seedBikes.run(3, "Bike 3", "hybrid");
    seedBikes.run(4, "Bike 4", "mountain");
    seedBikes.run(5, "Bike 5", "road");

    seedRentals.run(1, 1, 2, "2026-11-01 09:00:00", "2026-11-01 17:00:00");
    seedRentals.run(2, 2, 1, "2026-11-02 10:00:00", null);
    seedRentals.run(3, 3, 3, "2026-11-03 08:30:00", "2026-11-03 12:00:00");

    db.exec("COMMIT;");
  } catch (err) {
    db.exec("ROLLBACK;");
    console.error("Error seeding initial data:", err);
  }
}

module.exports = db;
