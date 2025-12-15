import { useState, useEffect, useContext } from "react";
import { SocketDataContext } from "../contexts/SocketContext";

/**
 * Hook for tracking ride location in real-time
 * @param {string} rideId - The ID of the ride to track
 * @param {Object} options - Configuration options
 * @returns {Object} Tracking data and methods
 */
function useRideTracking(rideId, options = {}) {
  const { socket } = useContext(SocketDataContext);
  const { updateInterval = 5000 } = options; // Update every 5 seconds by default
  
  const [driverLocation, setDriverLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!rideId || !socket) return;

    setIsTracking(true);

    // Listen for driver location updates
    socket.on("driver-location-update", (data) => {
      if (data.rideId === rideId) {
        setDriverLocation({
          lat: data.location.ltd || data.location.lat,
          lng: data.location.lng,
        });
        setLastUpdate(new Date());
      }
    });

    return () => {
      socket.off("driver-location-update");
      setIsTracking(false);
    };
  }, [rideId, socket]);

  // Request current driver location
  const requestLocation = () => {
    if (socket && rideId) {
      socket.emit("request-driver-location", { rideId });
    }
  };

  return {
    driverLocation,
    isTracking,
    lastUpdate,
    requestLocation,
  };
}

export default useRideTracking;
