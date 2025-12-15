import { createContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

export const SocketDataContext = createContext();

import Console from "../utils/console";
import persistenceManager from "../utils/persistenceManager";

function SocketContext({ children }) {
  // Track socket connection state
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [activeRide, setActiveRide] = useState(null);

  // Load persisted ride data
  useEffect(() => {
    const persistedRide = persistenceManager.ride.loadRideState();
    if (persistedRide) {
      setActiveRide(persistedRide);
      Console.log("Loaded persisted ride:", persistedRide.rideId);
    }
  }, []);

  // Create socket instance only once using useMemo
  // CRITICAL-003 + HIGH-010: Send token with socket connection for authentication
  const socket = useMemo(() => {
    const token = localStorage.getItem("token");
    const socketInstance = io(`${import.meta.env.VITE_SERVER_URL}`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10, // Increased reconnection attempts
    });
    Console.log("Socket.io instance created with authentication");
    return socketInstance;
  }, []); // Empty dependency array ensures this only runs once

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      setReconnectAttempt(0);
      Console.log("Connected to server (authenticated)");
      
      // Attempt to rejoin active ride room if there's a persisted ride
      if (activeRide && activeRide.rideId) {
        Console.log(`Attempting to rejoin ride room: ${activeRide.rideId}`);
        socket.emit("rejoin-ride", {
          rideId: activeRide.rideId,
          userType: activeRide.captain ? "captain" : "user"
        });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      Console.log("Disconnected from server");
    });

    socket.on("reconnect_attempt", (attempt) => {
      setReconnectAttempt(attempt);
      Console.log(`Socket reconnection attempt ${attempt}`);
    });

    // Handle ride rejoining success/failure
    socket.on("rejoin-ride-success", (updatedRideData) => {
      Console.log("Successfully rejoined ride room", updatedRideData);
      // Update local state with the latest from server
      setActiveRide(updatedRideData);
      // Update persisted state
      persistenceManager.ride.saveRideState(updatedRideData);
    });

    socket.on("rejoin-ride-error", (error) => {
      Console.error("Failed to rejoin ride room:", error);
      // If the ride doesn't exist anymore, clear persisted state
      if (error.message === "Ride not found" || error.message === "Ride completed") {
        persistenceManager.ride.clearRideState();
        setActiveRide(null);
      }
    });

    // Handle authentication errors
    socket.on("connect_error", (err) => {
      Console.error("Socket connection error:", err.message);
      if (err.message === "Authentication required" || err.message === "Invalid token" || err.message === "Token blacklisted") {
        Console.log("Socket authentication failed - user may need to re-login");
      }
    });

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      Console.log("Cleaning up socket connection");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnect_attempt");
      socket.off("rejoin-ride-success");
      socket.off("rejoin-ride-error");
      socket.off("connect_error");
    };
  }, [socket, activeRide]);

  /**
   * Join a ride room and update persistence
   * @param {string} rideId - ID of the ride to join
   * @param {Object} rideData - Full ride data
   * @param {string} userType - "user" or "captain"
   */
  const joinRideRoom = (rideId, rideData, userType) => {
    if (!rideId || !socket) return;
    
    // Join the room
    socket.emit("join-ride", { rideId, userType });
    
    // Update active ride state
    setActiveRide(rideData);
    
    // Persist the ride data
    persistenceManager.ride.saveRideState(rideData);
  };

  /**
   * Leave a ride room and clear persistence
   * @param {string} rideId - ID of the ride to leave
   */
  const leaveRideRoom = (rideId) => {
    if (!rideId || !socket) return;
    
    // Leave the room
    socket.emit("leave-ride", { rideId });
    
    // Clear active ride state
    setActiveRide(null);
    
    // Clear persisted ride data
    persistenceManager.ride.clearRideState();
  };

  // PERF-010: Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    socket,
    isConnected,
    reconnectAttempt,
    activeRide,
    joinRideRoom,
    leaveRideRoom
  }), [socket, isConnected, reconnectAttempt, activeRide]);

  return (
    <SocketDataContext.Provider value={value}>
      {children}
    </SocketDataContext.Provider>
  );
}

export default SocketContext;
