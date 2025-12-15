const rideModel = require("../models/ride.model");
const captainModel = require("../models/captain.model");

/**
 * Ride Matching Service
 * Handles finding pending rides for late-joining captains
 * and geospatial matching for ride broadcasts
 */

// Configuration
const RIDE_FRESHNESS_MS = 5 * 60 * 1000; // 5 minutes - rides older than this are stale
const RIDE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes - rides older than this are expired
const MAX_RIDES_PER_CAPTAIN = 5; // Maximum rides to offer to a single captain
const DEFAULT_RADIUS_KM = 10; // Default search radius in km

// In-memory tracking of offered rides to prevent duplicates
// Key: `${rideId}-${captainId}`, Value: timestamp
const offeredRidesMap = new Map();

// Cleanup interval for stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const staleThreshold = 10 * 60 * 1000; // 10 minutes
  
  for (const [key, timestamp] of offeredRidesMap.entries()) {
    if (now - timestamp > staleThreshold) {
      offeredRidesMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if a ride has already been offered to a captain
 * Uses both in-memory map and database array
 */
function hasBeenOffered(rideId, captainId) {
  const key = `${rideId}-${captainId}`;
  return offeredRidesMap.has(key);
}

/**
 * Mark a ride as offered to a captain
 */
function markAsOffered(rideId, captainId) {
  const key = `${rideId}-${captainId}`;
  offeredRidesMap.set(key, Date.now());
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get search radius based on vehicle type
 */
function getRadiusForVehicle(vehicleType) {
  const radiusMap = {
    car: 15,
    bike: 8,
    moto: 8,
    carro: 15,
  };
  return radiusMap[vehicleType] || DEFAULT_RADIUS_KM;
}

/**
 * Find pending rides for a captain who just connected
 * @param {string} captainId - The captain's ID
 * @param {object} location - Captain's current location { lat, lng }
 * @param {string} vehicleType - Captain's vehicle type
 * @returns {Promise<Array>} Array of matching rides
 */
async function findPendingRidesForCaptain(captainId, location, vehicleType) {
  try {
    if (!location?.lat || !location?.lng) {
      console.log("[RideMatching] No location provided for captain:", captainId);
      return [];
    }

    const freshnessThreshold = new Date(Date.now() - RIDE_FRESHNESS_MS);
    const searchRadius = getRadiusForVehicle(vehicleType);

    // Normalize vehicle type
    const normalizedVehicle = vehicleType === "carro" ? "car" : 
                              vehicleType === "moto" ? "bike" : vehicleType;

    // Find pending rides that match criteria
    const pendingRides = await rideModel.find({
      status: "pending",
      createdAt: { $gte: freshnessThreshold },
      captain: { $exists: false }, // Not yet accepted
      vehicle: { $in: [normalizedVehicle, vehicleType] }, // Match vehicle type
      offeredTo: { $ne: captainId }, // Not already offered to this captain
    })
    .populate("user", "fullname profileImage phone rating")
    .sort({ createdAt: -1 })
    .limit(MAX_RIDES_PER_CAPTAIN * 2) // Get extra to filter by distance
    .lean();

    if (pendingRides.length === 0) {
      return [];
    }

    // Filter by distance and check in-memory map
    const matchingRides = [];
    
    for (const ride of pendingRides) {
      // Skip if already offered (in-memory check)
      if (hasBeenOffered(ride._id.toString(), captainId)) {
        continue;
      }

      // Check distance if pickup coordinates exist
      if (ride.pickupCoordinates?.lat && ride.pickupCoordinates?.lng) {
        const distance = calculateDistanceKm(
          location.lat,
          location.lng,
          ride.pickupCoordinates.lat,
          ride.pickupCoordinates.lng
        );

        if (distance > searchRadius) {
          continue; // Too far
        }

        // Add distance to ride object for sorting
        ride.distanceFromCaptain = distance;
      }

      // Calculate time remaining before expiration
      const ageMs = Date.now() - new Date(ride.createdAt).getTime();
      ride.timeRemaining = Math.max(0, Math.ceil((RIDE_FRESHNESS_MS - ageMs) / 1000));

      matchingRides.push(ride);

      if (matchingRides.length >= MAX_RIDES_PER_CAPTAIN) {
        break;
      }
    }

    // Sort by distance (closest first)
    matchingRides.sort((a, b) => 
      (a.distanceFromCaptain || 999) - (b.distanceFromCaptain || 999)
    );

    return matchingRides;
  } catch (error) {
    console.error("[RideMatching] Error finding pending rides:", error);
    return [];
  }
}

/**
 * Find captains in radius for a new ride
 * @param {object} pickupLocation - Pickup coordinates { lat, lng }
 * @param {string} vehicleType - Required vehicle type
 * @param {number} radiusKm - Search radius in km
 * @returns {Promise<Array>} Array of captain IDs with socket IDs
 */
async function findCaptainsInRadius(pickupLocation, vehicleType, radiusKm = DEFAULT_RADIUS_KM) {
  try {
    if (!pickupLocation?.lat || !pickupLocation?.lng) {
      console.log("[RideMatching] No pickup location provided");
      return [];
    }

    // Normalize vehicle type
    const normalizedVehicle = vehicleType === "carro" ? "car" : 
                              vehicleType === "moto" ? "bike" : vehicleType;

    // Use MongoDB geospatial query
    const captains = await captainModel.find({
      status: "active",
      socketId: { $exists: true, $ne: null },
      "vehicle.type": { $in: [normalizedVehicle, vehicleType] },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [pickupLocation.lng, pickupLocation.lat]
          },
          $maxDistance: radiusKm * 1000 // Convert to meters
        }
      }
    })
    .select("_id socketId fullname vehicle location")
    .limit(50)
    .lean();

    return captains;
  } catch (error) {
    console.error("[RideMatching] Error finding captains in radius:", error);
    return [];
  }
}

/**
 * Mark ride as offered to a captain in database
 */
async function markRideOfferedInDB(rideId, captainId) {
  try {
    await rideModel.findByIdAndUpdate(rideId, {
      $addToSet: { offeredTo: captainId }
    });
    markAsOffered(rideId, captainId);
  } catch (error) {
    console.error("[RideMatching] Error marking ride as offered:", error);
  }
}

/**
 * Expire old pending rides
 * Should be called periodically (e.g., every minute)
 */
async function expireOldRides() {
  try {
    const expirationThreshold = new Date(Date.now() - RIDE_EXPIRATION_MS);
    
    const result = await rideModel.updateMany(
      {
        status: "pending",
        createdAt: { $lt: expirationThreshold }
      },
      {
        $set: { status: "cancelled" }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[RideMatching] Expired ${result.modifiedCount} old rides`);
    }

    return result.modifiedCount;
  } catch (error) {
    console.error("[RideMatching] Error expiring old rides:", error);
    return 0;
  }
}

/**
 * Get ride freshness status
 */
function getRideFreshness(createdAt) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  
  if (ageMs > RIDE_EXPIRATION_MS) {
    return "expired";
  } else if (ageMs > RIDE_FRESHNESS_MS) {
    return "stale";
  }
  return "fresh";
}

module.exports = {
  findPendingRidesForCaptain,
  findCaptainsInRadius,
  markRideOfferedInDB,
  markAsOffered,
  hasBeenOffered,
  expireOldRides,
  getRideFreshness,
  calculateDistanceKm,
  RIDE_FRESHNESS_MS,
  RIDE_EXPIRATION_MS,
};
