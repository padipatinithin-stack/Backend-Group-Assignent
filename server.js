// ─── SpinCycle Bikes — Main Server ──────────────────────────────
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Import routes
const ridersRoutes = require("./routes/riders");
const bikesRoutes = require("./routes/bikes");
const rentalsRoutes = require("./routes/rentals");

// Mount routes
app.use("/riders", ridersRoutes);
app.use("/bikes", bikesRoutes);
app.use("/rentals", rentalsRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SpinCycle Bikes API 🚲",
    endpoints: {
      riders: "/riders",
      bikes: "/bikes",
      rentals: "/rentals",
      rental_details: "/rentals/details/all",
    },
  });
});

// Start server only when executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SpinCycle Bikes API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
