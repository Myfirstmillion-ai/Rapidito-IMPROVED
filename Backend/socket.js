const moment = require("moment-timezone");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user.model");
const rideModel = require("./models/ride.model");
const captainModel = require("./models/captain.model");
const frontendLogModel = require("./models/frontend-log.model");
const blacklistTokenModel = require("./models/blacklistToken.model");
const rideMatchingService = require("./services/ride-matching.service");

let io;
// Map to track connected drivers for better management
const connectedDrivers = new Map();
// Map to store last known locations for ETA calculation
const driverLocations = new Map();
// Minimum distance change (in meters) to trigger broadcast
const MIN_DISTANCE_CHANGE = 5;
// Throttle interval for location updates (ms)
const LOCATION_UPDATE_THROTTLE = 1000;

// PERF-006: Periodic cleanup of stale drivers to prevent memory leaks
// Runs every 5 minutes, removes drivers inactive for more than 1 hour
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [driverId, data] of connectedDrivers.entries()) {
    const lastUpdate = data.lastLocationUpdate?.getTime() || data.connectedAt?.getTime() || 0;
    // Remove if inactive for more than 1 hour (3600000ms)
    if (now - lastUpdate > 3600000) {
      connectedDrivers.delete(driverId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 PERF-006: Cleaned up ${cleanedCount} stale driver(s) from memory`);
  }
}, 300000); // Every 5 minutes

// RIDE TTL: Auto-expire old pending rides every minute
setInterval(async () => {
  try {
    const expiredCount = await rideMatchingService.expireOldRides();
    if (expiredCount > 0 && io) {
      // Notify users whose rides expired
      const expiredRides = await rideModel.find({
        status: "cancelled",
        updatedAt: { $gte: new Date(Date.now() - 60000) } // Last minute
      }).select("user _id");
      
      for (const ride of expiredRides) {
        if (ride.user) {
          io.to(`user-${ride.user}`).emit("ride-expired", {
            rideId: ride._id,
            message: "Tu solicitud de viaje ha expirado. Por favor, intenta de nuevo.",
          });
        }
      }
    }
  } catch (err) {
    console.error("[RideTTL] Error in auto-expiration:", err.message);
  }
}, 60000); // Every minute

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Calculate distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  return calculateDistance(lat1, lon1, lat2, lon2) * 1000;
}

// Calculate ETA based on distance and speed
function calculateETA(distanceKm, speedKmh) {
  if (!speedKmh || speedKmh <= 0) {
    // Default average speed: 30 km/h for urban areas
    speedKmh = 30;
  }
  const timeHours = distanceKm / speedKmh;
  const timeMinutes = Math.ceil(timeHours * 60);
  return timeMinutes;
}

// Calculate bearing between two points
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360; // Normalize to 0-360
}

function initializeSocket(server) {
  // Configure CORS based on environment
  const allowedOrigins = process.env.ENVIRONMENT === "production"
    ? (process.env.CLIENT_URL || (() => {
        console.error("CRITICAL: CLIENT_URL not set in production. Refusing to start.");
        process.exit(1);
      })()) // Only allow the specific client URL in production
    : "*"; // Allow all in development for easier testing

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true, // Allow credentials (cookies, authorization headers)
    },
    // Enable reconnection
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // CRITICAL-003: Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.headers.token ||
                    socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error("Authentication required"));
      }
      
      // Check if token is blacklisted
      const isBlacklisted = await blacklistTokenModel.findOne({ token });
      if (isBlacklisted) {
        return next(new Error("Token blacklisted"));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userType = decoded.userType;
      
      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Cliente autenticado: ${socket.id} (${socket.userType}: ${socket.userId})`);

    if (process.env.ENVIRONMENT === "production") {
      socket.on("log", async (log) => {
        log.formattedTimestamp = moment().tz("America/Bogota").format("MMM DD hh:mm:ss A");
        try {
          await frontendLogModel.create(log);
        } catch (error) {
          console.log("Error enviando logs...");
        }
      });
    }

    socket.on("join", async (data) => {
      const { userId, userType } = data;
      
      // CRITICAL-003: Verify userId matches authenticated socket
      if (userId !== socket.userId || userType !== socket.userType) {
        return socket.emit("error", { message: "Unauthorized: ID mismatch" });
      }
      
      console.log(userType + " conectado: " + userId);
      
      if (userType === "user") {
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        socket.join(`user-${userId}`);
      } else if (userType === "captain") {
        const captain = await captainModel.findByIdAndUpdate(
          userId, 
          { socketId: socket.id },
          { new: true }
        );
        // Join driver-specific room for targeted messages
        socket.join(`driver-${userId}`);
        // Track connected driver
        connectedDrivers.set(userId, {
          socketId: socket.id,
          connectedAt: new Date(),
        });
        // Confirm registration to the driver
        socket.emit("driver:registered", {
          driverId: userId,
          socketId: socket.id,
          timestamp: new Date(),
        });
        console.log(`Driver ${userId} registered and joined room driver-${userId}`);

        // REACTIVE LATE JOINER: Check for pending rides when captain connects
        if (captain && captain.status === "active" && captain.location?.coordinates) {
          const [lng, lat] = captain.location.coordinates;
          const vehicleType = captain.vehicle?.type || "car";
          
          try {
            const pendingRides = await rideMatchingService.findPendingRidesForCaptain(
              userId,
              { lat, lng },
              vehicleType
            );

            if (pendingRides.length > 0) {
              console.log(`[LateJoiner] Found ${pendingRides.length} pending rides for captain ${userId}`);
              
              for (const ride of pendingRides) {
                // Mark as offered to prevent duplicates
                await rideMatchingService.markRideOfferedInDB(ride._id.toString(), userId);
                
                // Send ride request to captain
                socket.emit("new-ride", {
                  ...ride,
                  otp: undefined, // Hide OTP
                  timeRemaining: ride.timeRemaining,
                  isLateJoinOffer: true,
                });
                
                console.log(`[LateJoiner] Sent ride ${ride._id} to captain ${userId}`);
              }
            }
          } catch (err) {
            console.error(`[LateJoiner] Error finding pending rides:`, err.message);
          }
        }
      }
    });

    // Handle driver going online/offline
    socket.on("driver:toggleOnline", async (data) => {
      const { driverId, isOnline } = data;
      
      try {
        // Update captain status in database
        const captain = await captainModel.findByIdAndUpdate(
          driverId,
          { status: isOnline ? 'active' : 'inactive' },
          { new: true }
        );

        if (!captain) {
          socket.emit("error", { message: "Conductor no encontrado" });
          return;
        }

        console.log(`Driver ${driverId} status changed to: ${isOnline ? 'active' : 'inactive'}`);

        // REACTIVE LATE JOINER: If driver is going ONLINE, send them pending rides
        if (isOnline && captain.location && captain.location.coordinates) {
          const [lng, lat] = captain.location.coordinates;
          const vehicleType = captain.vehicle?.type || "car";

          try {
            const pendingRides = await rideMatchingService.findPendingRidesForCaptain(
              driverId,
              { lat, lng },
              vehicleType
            );

            if (pendingRides.length > 0) {
              console.log(`[LateJoiner] Found ${pendingRides.length} pending rides for captain ${driverId} going online`);
              
              for (const ride of pendingRides) {
                // Mark as offered to prevent duplicates
                await rideMatchingService.markRideOfferedInDB(ride._id.toString(), driverId);
                
                // Send ride request to captain
                socket.emit("new-ride", {
                  ...ride,
                  otp: undefined, // Hide OTP
                  timeRemaining: ride.timeRemaining,
                  isLateJoinOffer: true,
                });
                
                console.log(`[LateJoiner] Sent ride ${ride._id} to captain ${driverId}`);
              }
            }
          } catch (err) {
            console.error(`[LateJoiner] Error finding pending rides:`, err.message);
          }
        }

        // Confirm status change
        socket.emit("driver:onlineStatusChanged", {
          isOnline,
          timestamp: new Date()
        });
      } catch (error) {
        console.error("Error toggling driver online status:", error);
        socket.emit("error", { message: "Error al cambiar estado" });
      }
    });

    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;

      // CRITICAL-003: Verify userId matches authenticated socket
      if (userId !== socket.userId) {
        return socket.emit("error", { message: "Unauthorized: Cannot update another user's location" });
      }

      if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return socket.emit("error", { message: "Datos de ubicación inválidos" });
      }
      
      // HIGH-009: Validate coordinate ranges
      if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
        return socket.emit("error", { message: "Coordenadas fuera de rango válido" });
      }
      
      await captainModel.findByIdAndUpdate(userId, {
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
      });

      // Update the tracking map
      if (connectedDrivers.has(userId)) {
        const driverData = connectedDrivers.get(userId);
        connectedDrivers.set(userId, {
          ...driverData,
          lastLocation: location,
          lastLocationUpdate: new Date(),
        });
      }
    });

    // Enhanced driver location update with ride tracking - PROFESSIONAL TRACKING
    socket.on("driver:locationUpdate", async (data) => {
      const { driverId, location, rideId, heading, speed, accuracy } = data;
      
      // CRITICAL-003: Verify driverId matches authenticated socket
      if (driverId !== socket.userId) {
        return socket.emit("error", { message: "Unauthorized: Cannot update another driver's location" });
      }
      
      if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return socket.emit("error", { message: "Datos de ubicación inválidos" });
      }
      
      // HIGH-009: Validate coordinate ranges
      if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
        return socket.emit("error", { message: "Coordenadas fuera de rango válido" });
      }

      try {
        const now = Date.now();
        const lastLocationData = driverLocations.get(driverId);
        
        // Check if we should broadcast (throttle + minimum distance)
        let shouldBroadcast = true;
        let calculatedHeading = heading;
        
        if (lastLocationData) {
          const timeSinceLastUpdate = now - lastLocationData.timestamp;
          const distanceChanged = calculateDistanceMeters(
            lastLocationData.lat, lastLocationData.lng,
            location.lat, location.lng
          );
          
          // Throttle: don't broadcast if less than threshold time AND distance
          if (timeSinceLastUpdate < LOCATION_UPDATE_THROTTLE && distanceChanged < MIN_DISTANCE_CHANGE) {
            shouldBroadcast = false;
          }
          
          // Calculate heading if not provided
          if (!calculatedHeading && distanceChanged > 1) {
            calculatedHeading = calculateBearing(
              lastLocationData.lat, lastLocationData.lng,
              location.lat, location.lng
            );
          }
        }

        // Update driver location in database (always)
        await captainModel.findByIdAndUpdate(driverId, {
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
        });

        // Store location data for next calculation
        driverLocations.set(driverId, {
          lat: location.lat,
          lng: location.lng,
          heading: calculatedHeading || 0,
          speed: speed || 0,
          timestamp: now,
        });

        // If driver has an active ride and should broadcast, notify the passenger
        if (rideId && shouldBroadcast) {
          const ride = await rideModel.findById(rideId).populate('user');
          if (ride && ride.user) {
            // Calculate distance to destination
            let distanceToDestination = null;
            let eta = null;
            
            // Determine target based on ride status
            const targetAddress = ride.status === 'accepted' ? ride.pickup : ride.destination;
            
            if (targetAddress) {
              try {
                const mapService = require("./services/map.service");
                const targetCoords = await mapService.getAddressCoordinate(targetAddress);
                if (targetCoords) {
                  distanceToDestination = calculateDistance(
                    location.lat, location.lng,
                    targetCoords.lat, targetCoords.lng
                  );
                  eta = calculateETA(distanceToDestination, speed || 30);
                }
              } catch (err) {
                console.error("Error calculating ETA:", err.message);
              }
            }

            // Send enhanced location update to the passenger via room
            const locationPayload = {
              lat: location.lat,
              lng: location.lng,
              heading: calculatedHeading || 0,
              speed: speed || 0,
              accuracy: accuracy || 0,
              eta,
              distance: distanceToDestination,
              rideId,
              driverId,
              timestamp: now,
            };

            // Emit to user's personal room
            io.to(`user-${ride.user._id}`).emit('driver-location', locationPayload);
            
            // Also emit to ride-specific room for any listeners
            io.to(`ride-${rideId}`).emit('driver-location', locationPayload);
          }
        }

        // Update tracking map
        if (connectedDrivers.has(driverId)) {
          const driverData = connectedDrivers.get(driverId);
          connectedDrivers.set(driverId, {
            ...driverData,
            lastLocation: location,
            lastLocationUpdate: new Date(),
            activeRideId: rideId || null,
            heading: calculatedHeading,
            speed: speed || 0,
          });
        }
      } catch (error) {
        console.error("Error updating driver location:", error);
        socket.emit("error", { message: "Error al actualizar ubicación" });
      }
    });

    // Professional location-update event (alias for compatibility)
    socket.on("location-update", async (data) => {
      // Forward to driver:locationUpdate handler
      socket.emit("driver:locationUpdate", {
        driverId: socket.userId,
        ...data,
      });
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.id} se unió a la sala: ${roomId}`);
    });
    
    // Handle ride rejoining after page reload
    socket.on("rejoin-ride", async ({ rideId, userType }) => {
      try {
        if (!rideId) {
          return socket.emit("rejoin-ride-error", { message: "Ride ID is required" });
        }
        
        // Find the active ride
        const ride = await rideModel.findOne({
          _id: rideId,
          status: { $in: ['pending', 'accepted', 'ongoing'] }
        }).populate({
          path: "user",
          select: "fullname email phone profileImage rating"
        }).populate({
          path: "captain",
          select: "fullname email phone profileImage rating vehicle location socketId"
        });
        
        if (!ride) {
          return socket.emit("rejoin-ride-error", { message: "Ride not found" });
        }
        
        // Verify user is part of this ride
        let isAuthorized = false;
        if (userType === "user" && ride.user && ride.user._id.toString() === socket.userId) {
          isAuthorized = true;
        } else if (userType === "captain" && ride.captain && ride.captain._id.toString() === socket.userId) {
          isAuthorized = true;
        }
        
        if (!isAuthorized) {
          return socket.emit("rejoin-ride-error", { message: "Unauthorized to access this ride" });
        }
        
        // Join the ride room
        const roomId = `ride-${rideId}`;
        socket.join(roomId);
        console.log(`${socket.id} (${userType}: ${socket.userId}) rejoin ride room: ${roomId}`);
        
        // Update socket ID in database
        if (userType === "user") {
          await userModel.findByIdAndUpdate(socket.userId, { socketId: socket.id });
        } else if (userType === "captain") {
          await captainModel.findByIdAndUpdate(socket.userId, { socketId: socket.id });
          
          // Update the tracking map
          if (ride.captain && ride.captain.location) {
            const location = {
              lat: ride.captain.location.coordinates[1],
              lng: ride.captain.location.coordinates[0]
            };
            
            connectedDrivers.set(socket.userId, {
              socketId: socket.id,
              lastLocation: location,
              lastLocationUpdate: new Date(),
              connectedAt: new Date(),
              activeRideId: rideId
            });
          }
        }
        
        // Send success response with the updated ride data
        socket.emit("rejoin-ride-success", ride);
        
        // Notify others in the ride room that user reconnected
        socket.to(roomId).emit("user-reconnected", {
          userId: socket.userId,
          userType,
          timestamp: new Date()
        });
        
      } catch (error) {
        console.error("Error rejoining ride:", error);
        socket.emit("rejoin-ride-error", { message: "Error rejoining ride" });
      }
    });

    // Eventos de typing para el chat
    socket.on("typing", ({ rideId, userType }) => {
      socket.to(rideId).emit("user-typing", { userType });
    });

    socket.on("stop-typing", ({ rideId, userType }) => {
      socket.to(rideId).emit("user-stop-typing", { userType });
    });

    socket.on("message", async ({ rideId, msg, userType, time }) => {
      const date = moment().tz("America/Bogota").format("MMM DD");
      socket.to(rideId).emit("receiveMessage", { msg, by: userType, time });
      try {
        const ride = await rideModel.findOne({ _id: rideId });
        if (ride) {
          ride.messages.push({
            msg: msg,
            by: userType,
            time: time,
            date: date,
            timestamp: new Date(),
          });
          await ride.save();
        }
      } catch (error) {
        console.log("Error guardando mensaje: ", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);
      // Clean up driver tracking on disconnect
      for (const [driverId, driverData] of connectedDrivers.entries()) {
        if (driverData.socketId === socket.id) {
          connectedDrivers.delete(driverId);
          console.log(`Driver ${driverId} removed from tracking`);
          break;
        }
      }
    });
  });
}

const sendMessageToSocketId = (socketId, messageObject) => {
  if (io) {
    console.log("Mensaje enviado a: ", socketId);
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io no inicializado.");
  }
};

// New helper function to send to room
const sendMessageToRoom = (room, messageObject) => {
  if (io) {
    console.log(`Mensaje enviado a sala: ${room}`);
    io.to(room).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io no inicializado.");
  }
};

// Get connected drivers count
const getConnectedDriversCount = () => {
  return connectedDrivers.size;
};

module.exports = { 
  initializeSocket, 
  sendMessageToSocketId,
  sendMessageToRoom,
  getConnectedDriversCount,
};
