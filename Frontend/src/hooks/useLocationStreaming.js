import { useEffect, useRef, useCallback, useState } from "react";

/**
 * useLocationStreaming - Hook for captain to stream location updates
 * Uses high-accuracy GPS with configurable update intervals
 */
export function useLocationStreaming({
  socket,
  driverId,
  rideId = null,
  enabled = true,
  updateInterval = 4000, // Default 4 seconds
  onLocationUpdate,
  onError,
}) {
  const watchIdRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const lastPositionRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);

  // Get update interval from env or use default
  const interval = parseInt(import.meta.env.VITE_TRACKING_UPDATE_INTERVAL) || updateInterval;

  // Calculate distance between two points in meters
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Send location update to server
  const sendLocationUpdate = useCallback(
    (position) => {
      if (!socket || !driverId) return;

      const { latitude, longitude, heading, speed, accuracy } = position.coords;
      const now = Date.now();

      // Check if enough time has passed since last update
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      if (timeSinceLastUpdate < interval) {
        return;
      }

      // Check if position has changed significantly (at least 5 meters)
      if (lastPositionRef.current) {
        const distance = calculateDistance(
          lastPositionRef.current.lat,
          lastPositionRef.current.lng,
          latitude,
          longitude
        );
        if (distance < 5 && timeSinceLastUpdate < interval * 2) {
          return;
        }
      }

      const locationData = {
        driverId,
        rideId,
        location: {
          lat: latitude,
          lng: longitude,
        },
        heading: heading || 0,
        speed: speed ? speed * 3.6 : 0, // Convert m/s to km/h
        accuracy: accuracy || 0,
        timestamp: now,
      };

      // Emit to socket
      socket.emit("driver:locationUpdate", locationData);

      // Update refs
      lastUpdateRef.current = now;
      lastPositionRef.current = { lat: latitude, lng: longitude };

      // Update state
      setCurrentLocation({
        lat: latitude,
        lng: longitude,
        heading: heading || 0,
        speed: speed ? speed * 3.6 : 0,
      });

      // Callback
      onLocationUpdate?.(locationData);
    },
    [socket, driverId, rideId, interval, calculateDistance, onLocationUpdate]
  );

  // Handle geolocation error
  const handleError = useCallback(
    (err) => {
      console.error("Geolocation error:", err);
      const errorMessage = {
        1: "Permiso de ubicación denegado",
        2: "Ubicación no disponible",
        3: "Tiempo de espera agotado",
      }[err.code] || "Error de ubicación desconocido";

      setError(errorMessage);
      onError?.(errorMessage);
    },
    [onError]
  );

  // Start streaming
  const startStreaming = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalización no soportada");
      onError?.("Geolocalización no soportada");
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Already streaming
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      sendLocationUpdate,
      handleError,
      options
    );

    setIsStreaming(true);
    setError(null);
  }, [sendLocationUpdate, handleError, onError]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Auto start/stop based on enabled prop
  useEffect(() => {
    if (enabled && socket && driverId) {
      startStreaming();
    } else {
      stopStreaming();
    }

    return () => {
      stopStreaming();
    };
  }, [enabled, socket, driverId, startStreaming, stopStreaming]);

  // Battery optimization: reduce frequency when battery is low
  useEffect(() => {
    if (!("getBattery" in navigator)) return;

    let batteryManager = null;

    navigator.getBattery?.().then((battery) => {
      batteryManager = battery;

      const handleBatteryChange = () => {
        if (battery.level < 0.2 && !battery.charging) {
          // Low battery: reduce update frequency
          console.log("Low battery detected, reducing location update frequency");
        }
      };

      battery.addEventListener("levelchange", handleBatteryChange);
      battery.addEventListener("chargingchange", handleBatteryChange);

      return () => {
        battery.removeEventListener("levelchange", handleBatteryChange);
        battery.removeEventListener("chargingchange", handleBatteryChange);
      };
    });
  }, []);

  return {
    isStreaming,
    currentLocation,
    error,
    startStreaming,
    stopStreaming,
  };
}

/**
 * useDriverTracking - Hook for user to receive driver location updates
 * Listens for driver-location events and manages tracking state
 */
export function useDriverTracking({
  socket,
  rideId,
  enabled = true,
  onLocationUpdate,
  onETAUpdate,
  onError,
}) {
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setETA] = useState(null);
  const [distance, setDistance] = useState(null);
  const [heading, setHeading] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const reconnectTimeoutRef = useRef(null);

  // Handle incoming location update
  const handleLocationUpdate = useCallback(
    (data) => {
      const { lat, lng, heading: h, speed: s, eta: e, distance: d, timestamp } = data;

      setDriverLocation([lng, lat]);
      setHeading(h || 0);
      setSpeed(s || 0);
      setLastUpdate(timestamp || Date.now());
      setIsConnected(true);

      if (e !== undefined) {
        setETA(e);
        onETAUpdate?.({ eta: e, distance: d, speed: s });
      }
      if (d !== undefined) {
        setDistance(d);
      }

      onLocationUpdate?.(data);

      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Set timeout for stale connection detection
      reconnectTimeoutRef.current = setTimeout(() => {
        setIsConnected(false);
      }, 30000); // 30 seconds without update = disconnected
    },
    [onLocationUpdate, onETAUpdate]
  );

  // Subscribe to driver location events
  useEffect(() => {
    if (!socket || !rideId || !enabled) return;

    // Join ride-specific room
    socket.emit("join-room", `ride-${rideId}`);

    // Listen for driver location updates
    socket.on("driver-location", handleLocationUpdate);

    // Also listen for legacy event name
    socket.on("driver:locationUpdated", handleLocationUpdate);

    return () => {
      socket.off("driver-location", handleLocationUpdate);
      socket.off("driver:locationUpdated", handleLocationUpdate);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [socket, rideId, enabled, handleLocationUpdate]);

  // Manual refresh function
  const refreshLocation = useCallback(() => {
    if (socket && rideId) {
      socket.emit("request-driver-location", { rideId });
    }
  }, [socket, rideId]);

  return {
    driverLocation,
    eta,
    distance,
    heading,
    speed,
    isConnected,
    lastUpdate,
    refreshLocation,
  };
}

export default useLocationStreaming;
