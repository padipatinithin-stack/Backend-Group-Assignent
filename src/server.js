const express = require('express');
const riderRoutes = require('./routes/riderRoutes');
const bikeRoutes = require('./routes/bikeRoutes');
const rentalRoutes = require('./routes/rentalRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to SpinCycle Bikes API 🚲',
    endpoints: {
      bikes: '/api/bikes',
      riders: '/api/riders',
      rentals: '/api/rentals',
      rental_details_join: '/api/rentals/details'
    }
  });
});

// Mount modular API routes (under /api)
app.use('/api/riders', riderRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/rentals', rentalRoutes);

// Direct mounts for convenience
app.use('/riders', riderRoutes);
app.use('/bikes', bikeRoutes);
app.use('/rentals', rentalRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SpinCycle Bikes server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
