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

// Start ride (captain verifies OTP to begin ride)
router.post(
  '/start/:rideId',
  authMiddleware.authCaptain,
  param('rideId').isMongoId().withMessage('Valid ride ID is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
  rideController.startRide
);

// Complete ride
router.post(
  '/complete/:rideId',
  authMiddleware.authCaptain,
  param('rideId').isMongoId().withMessage('Valid ride ID is required'),
  rideController.completeRide
);

// Cancel ride - can be done by either user or captain
router.post(
  '/cancel/:rideId',
  [authMiddleware.authUser, authMiddleware.authCaptain],
  param('rideId').isMongoId().withMessage('Valid ride ID is required'),
  body('cancellationReason').optional(),
  rideController.cancelRide
);

// Get ride history
router.get(
  '/history',
  [authMiddleware.authUser, authMiddleware.authCaptain],
  rideController.getRideHistory
);

// Rate a completed ride
router.post(
  '/rate/:rideId',
  [authMiddleware.authUser, authMiddleware.authCaptain],
  param('rideId').isMongoId().withMessage('Valid ride ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional(),
  rideController.rateRide
);

// Add message to ride chat
router.post(
  '/message/:rideId',
  [authMiddleware.authUser, authMiddleware.authCaptain],
  param('rideId').isMongoId().withMessage('Valid ride ID is required'),
  body('message').notEmpty().withMessage('Message is required'),
  rideController.addMessage
);

module.exports = router;
