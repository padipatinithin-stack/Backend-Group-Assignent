const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { validateRental } = require('../middleware/validation');

// GET all rentals
router.get('/', rentalController.getAllRentals);

// GET JOIN endpoint: rentals with rider name and bike name
router.get('/details', rentalController.getRentalDetails);

// GET rental by ID
router.get('/:id', rentalController.getRentalById);

// POST create rental (with validation)
router.post('/', validateRental, rentalController.createRental);

// PUT update rental by ID
router.put('/:id', rentalController.updateRental);

// DELETE rental by ID
router.delete('/:id', rentalController.deleteRental);

module.exports = router;
