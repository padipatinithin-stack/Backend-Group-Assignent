const express = require('express');
const router = express.Router();
const bikeController = require('../controllers/bikeController');
const { validateBike } = require('../middleware/validation');

// GET all bikes (supports ?type= query param)
router.get('/', bikeController.getAllBikes);

// GET bike by ID
router.get('/:id', bikeController.getBikeById);

// POST create bike (with validation & twist check)
router.post('/', validateBike, bikeController.createBike);

// PUT update bike by ID (with validation & twist check)
router.put('/:id', validateBike, bikeController.updateBike);

// DELETE bike by ID
router.delete('/:id', bikeController.deleteBike);

module.exports = router;
