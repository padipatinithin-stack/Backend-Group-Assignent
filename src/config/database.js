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
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS bikes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  type       TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS rentals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  rider_id    INTEGER NOT NULL,
  bike_id     INTEGER NOT NULL,
  rented_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  returned_at TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE CASCADE,
  FOREIGN KEY (bike_id)  REFERENCES bikes(id)  ON DELETE CASCADE
);
`;

const defaultSeed = `
INSERT OR IGNORE INTO riders (id, name, email, created_at) VALUES
  (1, 'Alice Johnson', 'alice@campus.edu', datetime('now', 'localtime')),
  (2, 'Bob Smith', 'bob@campus.edu', datetime('now', 'localtime')),
  (3, 'Charlie Brown', 'charlie@campus.edu', datetime('now', 'localtime'));

INSERT OR IGNORE INTO bikes (id, name, type, created_at) VALUES
  (1, 'Bike 1', 'mountain', datetime('now', 'localtime')),
  (2, 'Bike 2', 'road', datetime('now', 'localtime')),
  (3, 'Bike 3', 'hybrid', datetime('now', 'localtime')),
  (4, 'Bike 4', 'mountain', datetime('now', 'localtime')),
  (5, 'Bike 5', 'road', datetime('now', 'localtime')),
  (6, 'Bike 6', 'electric', datetime('now', 'localtime'));

INSERT OR IGNORE INTO rentals (id, rider_id, bike_id, rented_at, returned_at, created_at) VALUES
  (1, 1, 2, '2026-11-01 09:00:00', '2026-11-01 17:00:00', datetime('now', 'localtime')),
  (2, 2, 1, '2026-11-02 10:00:00', NULL, datetime('now', 'localtime')),
  (3, 3, 3, '2026-11-03 08:30:00', '2026-11-03 12:00:00', datetime('now', 'localtime'));
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

  // Ensure created_at columns exist for existing tables
  try {
    const bikesCols = db.prepare('PRAGMA table_info(bikes)').all().map(c => c.name);
    if (!bikesCols.includes('created_at')) {
      db.exec("ALTER TABLE bikes ADD COLUMN created_at TEXT DEFAULT ''");
      db.exec("UPDATE bikes SET created_at = datetime('now', 'localtime') WHERE created_at = ''");
    }
  } catch (e) {}

  try {
    const ridersCols = db.prepare('PRAGMA table_info(riders)').all().map(c => c.name);
    if (!ridersCols.includes('created_at')) {
      db.exec("ALTER TABLE riders ADD COLUMN created_at TEXT DEFAULT ''");
      db.exec("UPDATE riders SET created_at = datetime('now', 'localtime') WHERE created_at = ''");
    }
  } catch (e) {}

  try {
    const rentalsCols = db.prepare('PRAGMA table_info(rentals)').all().map(c => c.name);
    if (!rentalsCols.includes('created_at')) {
      db.exec("ALTER TABLE rentals ADD COLUMN created_at TEXT DEFAULT ''");
      db.exec("UPDATE rentals SET created_at = datetime('now', 'localtime') WHERE created_at = ''");
    }
  } catch (e) {}

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
