-- SpinCycle Bikes Initial Seed Data

-- Sample Riders
INSERT OR IGNORE INTO riders (id, name, email) VALUES
  (1, 'Alice Johnson', 'alice@campus.edu'),
  (2, 'Bob Smith', 'bob@campus.edu'),
  (3, 'Charlie Brown', 'charlie@campus.edu');

-- Sample Bikes
INSERT OR IGNORE INTO bikes (id, name, type) VALUES
  (1, 'Bike 1', 'mountain'),
  (2, 'Bike 2', 'road'),
  (3, 'Bike 3', 'hybrid'),
  (4, 'Bike 4', 'mountain'),
  (5, 'Bike 5', 'road'),
  (6, 'Bike 6', 'electric');

-- Sample Rentals
INSERT OR IGNORE INTO rentals (id, rider_id, bike_id, rented_at, returned_at) VALUES
  (1, 1, 2, '2026-11-01 09:00:00', '2026-11-01 17:00:00'),
  (2, 2, 1, '2026-11-02 10:00:00', NULL),
  (3, 3, 3, '2026-11-03 08:30:00', '2026-11-03 12:00:00');
