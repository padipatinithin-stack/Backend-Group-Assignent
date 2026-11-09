const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../spincycle.db');

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

function initDb() {
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const seedPath = path.resolve(__dirname, '../../database/seed.sql');

  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  // Check if riders table already populated
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM riders').get();
  if (rowCount.count === 0) {
    const seed = fs.readFileSync(seedPath, 'utf8');
    db.exec(seed);
  }
}

initDb();

module.exports = db;
