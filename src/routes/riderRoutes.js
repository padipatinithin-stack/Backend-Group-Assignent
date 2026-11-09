const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');
const { validateRider } = require('../middleware/validation');

// GET all riders
router.get('/', riderController.getAllRiders);

// GET rider by ID
router.get('/:id', riderController.getRiderById);

// POST create rider (with validation)
router.post('/', validateRider, riderController.createRider);

// PUT update rider by ID (with validation)
router.put('/:id', validateRider, riderController.updateRider);

// DELETE rider by ID
router.delete('/:id', riderController.deleteRider);

module.exports = router;
