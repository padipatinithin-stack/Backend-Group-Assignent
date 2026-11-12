-- SpinCycle Bikes Database Schema
-- Tables: riders, bikes, rentals

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
