const path = require('path');
const fs = require('fs');
const os = require('os');

// In serverless environments like Vercel/AWS Lambda, root directory is read-only.
// We must store the writable SQLite database in os.tmpdir().
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

const dbPath = isServerless
  ? path.join(os.tmpdir(), 'spincycle.db')
  : path.resolve(__dirname, '../../spincycle.db');

let db;
try {
  const Database = require('better-sqlite3');
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
} catch {
  // Built-in Node SQLite (Node 22.5+)
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
}

const defaultSchema = `
PRAGMA foreign_keys = ON;

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
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE CASCADE,
  FOREIGN KEY (bike_id)  REFERENCES bikes(id)  ON DELETE CASCADE
);
`;

const defaultSeed = `
INSERT OR IGNORE INTO riders (id, name, email) VALUES
  (1, 'Alice Johnson', 'alice@campus.edu'),
  (2, 'Bob Smith', 'bob@campus.edu'),
  (3, 'Charlie Brown', 'charlie@campus.edu');

INSERT OR IGNORE INTO bikes (id, name, type) VALUES
  (1, 'Bike 1', 'mountain'),
  (2, 'Bike 2', 'road'),
  (3, 'Bike 3', 'hybrid'),
  (4, 'Bike 4', 'mountain'),
  (5, 'Bike 5', 'road'),
  (6, 'Bike 6', 'electric');

INSERT OR IGNORE INTO rentals (id, rider_id, bike_id, rented_at, returned_at) VALUES
  (1, 1, 2, '2026-11-01 09:00:00', '2026-11-01 17:00:00'),
  (2, 2, 1, '2026-11-02 10:00:00', NULL),
  (3, 3, 3, '2026-11-03 08:30:00', '2026-11-03 12:00:00');
`;

function initDb() {
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const seedPath = path.resolve(__dirname, '../../database/seed.sql');

  let schema = defaultSchema;
  try {
    if (fs.existsSync(schemaPath)) {
      schema = fs.readFileSync(schemaPath, 'utf8');
    }
  } catch (e) {
    // Fall back to defaultSchema
  }
  db.exec(schema);

  // Check if riders table already populated
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM riders').get();
  if (!rowCount || rowCount.count === 0) {
    let seed = defaultSeed;
    try {
      if (fs.existsSync(seedPath)) {
        seed = fs.readFileSync(seedPath, 'utf8');
      }
    } catch (e) {
      // Fall back to defaultSeed
    }
    db.exec(seed);
  }
}

initDb();

module.exports = db;
