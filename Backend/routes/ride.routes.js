const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const rideController = require('../controllers/ride.controller');
const { body, param } = require('express-validator');

// Get active ride for the authenticated user
// Used for ride state recovery after page reloads
router.get(
  '/active',
  authMiddleware.authUser,
  rideController.getActiveRide
);

// Keep all existing routes below

// Create a new ride
router.post(
  '/create',
  authMiddleware.authUser,
  body('pickup').notEmpty().withMessage('Pickup location is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('vehicleType').notEmpty().isIn(['car', 'bike']).withMessage('Valid vehicle type is required'),
  rideController.createRide
);

// Accept a ride
router.post(
  '/accept/:rideId',
  authMiddleware.authCaptain,
  param('rideId').isMongoId().withMessage('Valid ride ID is required'),
  rideController.acceptRide
);

// Other existing routes...

module.exports = router;
