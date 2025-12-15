const { validationResult } = require("express-validator");
const rideModel = require("../models/ride.model");
const userModel = require("../models/user.model");
const mapService = require("../services/map.service");
const rideService = require("../services/ride.service");
const { sendMessageToSocketId } = require("../config/socket");

/**
 * Get active ride for the authenticated user
 * Retrieves any ride that is in pending, accepted, or ongoing state
 * Used for ride state recovery after page reloads
 */
module.exports.getActiveRide = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find an active ride for this user (pending, accepted, or ongoing)
    const activeRide = await rideModel.findOne({
      user: userId,
      status: { $in: ['pending', 'accepted', 'ongoing'] }
    }).populate({
      path: "user",
      select: "fullname email phone profileImage rating"
    }).populate({
      path: "captain",
      select: "fullname email phone profileImage rating vehicle location socketId"
    });
    
    if (!activeRide) {
      return res.status(404).json({
        message: "No active ride found"
      });
    }
    
    // Return the active ride data
    res.status(200).json({
      success: true,
      ride: activeRide
    });
    
  } catch (error) {
    console.error("Error fetching active ride:", error);
    res.status(500).json({
      message: "Error retrieving active ride",
      error: error.message
    });
  }
};

// Existing controller methods...
// Include all existing methods from the original file here

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, vehicleType } = req.body;

  try {
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    const user = await userModel.findOne({ _id: req.user._id });
    if (user) {
      user.rides.push(ride._id);
      await user.save();
    }

    res.status(201).json(ride);

    Promise.resolve().then(async () => {
      try {
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        console.log("Pickup Coordinates", pickupCoordinates);

        const captainsInRadius = await mapService.getCaptainsInTheRadius(
          pickupCoordinates.lat,
          pickupCoordinates.lng,
          4,
          vehicleType
        );

        ride.otp = "";

        // CRITICAL: Populate ALL user fields to prevent frontend crashes
        const rideWithUser = await rideModel
          .findOne({ _id: ride._id })
          .populate({
            path: "user",
            select: "fullname email phone profileImage rating" // Ensure all needed fields are selected
          });

        // DEFENSIVE: Validate payload before emitting
        if (!rideWithUser || !rideWithUser.user) {
          console.error("Failed to populate user data for ride:", ride._id);
          return;
        }

        console.log(
          captainsInRadius.map(
            (captain) => `${captain.fullname.firstname} ${captain.fullname.lastname || ''}`
          ).join(', ')
        );
        
        captainsInRadius.forEach((captain) => {
          // DEFENSIVE: Only send to online drivers with valid socketId
          if (captain.socketId && captain.status === 'active') {
            sendMessageToSocketId(captain.socketId, {
              event: "new-ride",
              data: rideWithUser,
            });
          }
        });
      } catch (e) {
        console.error("Background task failed:", e.message);
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Include all other existing methods...
