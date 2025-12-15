const rideModel = require("../models/ride.model");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const { validationResult } = require("express-validator");
const { sendMessageToSocketId } = require("../socket");
const mongoose = require("mongoose");

/**
 * Submit rating for a completed ride
 * @route POST /ratings/submit
 */
module.exports.submitRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, stars, comment, raterType } = req.body;

  // HIGH-002: Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    return res.status(400).json({ message: "ID de viaje inválido" });
  }

  try {
    // Find the ride
    const ride = await rideModel
      .findById(rideId)
      .populate("user")
      .populate("captain");

    if (!ride) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    // Verify ride is completed
    if (ride.status !== "completed") {
      return res.status(400).json({ 
        message: "Solo puedes calificar viajes completados",
        currentStatus: ride.status
      });
    }

    // Verify the rater is part of this ride
    if (raterType === "user") {
      if (!req.user || ride.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          message: "No estás autorizado para calificar este viaje",
          reason: "No eres el pasajero de este viaje"
        });
      }

      // Check if user already rated
      if (ride.rating && ride.rating.userToCaptain && ride.rating.userToCaptain.stars) {
        return res.status(400).json({ 
          message: "Ya has calificado este viaje" 
        });
      }

      // Save rating to ride
      ride.rating = ride.rating || {};
      ride.rating.userToCaptain = {
        stars,
        comment: comment || "",
        createdAt: new Date(),
      };
      await ride.save();

      // Update captain's average rating
      const captain = await captainModel.findById(ride.captain._id);
      const currentCount = captain.rating.count || 0;
      const currentAverage = captain.rating.average || 0;
      const newCount = currentCount + 1;
      const newAverage = 
        (currentAverage * currentCount + stars) / newCount;
      
      captain.rating.average = Math.round(newAverage * 10) / 10;
      captain.rating.count = newCount;
      await captain.save();

      // Notify captain via socket
      if (captain.socketId) {
        sendMessageToSocketId(captain.socketId, {
          event: "rating:received",
          data: {
            rideId: ride._id,
            stars,
            newAverage: captain.rating.average,
          },
        });
      }

    } else if (raterType === "captain") {
      if (!req.captain || ride.captain._id.toString() !== req.captain._id.toString()) {
        return res.status(403).json({ 
          message: "No estás autorizado para calificar este viaje",
          reason: "No eres el conductor de este viaje"
        });
      }

      // Check if captain already rated
      if (ride.rating && ride.rating.captainToUser && ride.rating.captainToUser.stars) {
        return res.status(400).json({ 
          message: "Ya has calificado este viaje" 
        });
      }

      // Save rating to ride
      ride.rating = ride.rating || {};
      ride.rating.captainToUser = {
        stars,
        comment: comment || "",
        createdAt: new Date(),
      };
      await ride.save();

      // Update user's average rating
      const user = await userModel.findById(ride.user._id);
      const currentCount = user.rating.count || 0;
      const currentAverage = user.rating.average || 0;
      const newCount = currentCount + 1;
      const newAverage = 
        (currentAverage * currentCount + stars) / newCount;
      
      user.rating.average = Math.round(newAverage * 10) / 10;
      user.rating.count = newCount;
      await user.save();

      // Notify user via socket
      if (user.socketId) {
        sendMessageToSocketId(user.socketId, {
          event: "rating:received",
          data: {
            rideId: ride._id,
            stars,
            newAverage: user.rating.average,
          },
        });
      }
    }

    return res.status(200).json({
      message: "Calificación enviada exitosamente",
      ride: {
        _id: ride._id,
        rating: ride.rating,
      },
    });
  } catch (err) {
    console.error("Error submitting rating:", err);
    console.error("Error details:", {
      rideId,
      raterType,
      stars,
      userAuth: !!req.user,
      captainAuth: !!req.captain,
    });
    return res.status(500).json({ 
      message: "Error al procesar la calificación",
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

/**
 * Get rating status for a ride
 * @route GET /ratings/:rideId/status
 */
module.exports.getRatingStatus = async (req, res) => {
  const { rideId } = req.params;

  // HIGH-002: Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    return res.status(400).json({ message: "ID de viaje inválido" });
  }

  try {
    const ride = await rideModel.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const status = {
      rideId: ride._id,
      status: ride.status,
      userRated: !!(ride.rating && ride.rating.userToCaptain && ride.rating.userToCaptain.stars),
      captainRated: !!(ride.rating && ride.rating.captainToUser && ride.rating.captainToUser.stars),
    };

    return res.status(200).json(status);
  } catch (err) {
    console.error("Error getting rating status:", err);
    return res.status(500).json({ message: err.message });
  }
};
