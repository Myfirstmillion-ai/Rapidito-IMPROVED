import { useState, useEffect, useContext, useCallback } from "react";
import { SocketDataContext } from "../contexts/SocketContext";
import axios from "axios";

/**
 * Custom hook to manage rating modal state and functionality
 * - Listens for rating:request socket events
 * - Checks localStorage for pending ratings
 * - Manages persistence of pending ratings
 * - Provides utility functions for rating submission
 * 
 * @returns {Object} - Rating modal state and functions
 */
export function useRatingModal() {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingData, setRatingData] = useState(null);
  const [pendingRatings, setPendingRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useContext(SocketDataContext);

  // Load any pending ratings from localStorage on mount
  useEffect(() => {
    const storedPendingRatings = localStorage.getItem('pendingRatings');
    if (storedPendingRatings) {
      try {
        const parsedRatings = JSON.parse(storedPendingRatings);
        if (Array.isArray(parsedRatings) && parsedRatings.length > 0) {
          setPendingRatings(parsedRatings);
          // Show the first pending rating
          setRatingData(parsedRatings[0]);
          setIsRatingModalOpen(true);
        }
      } catch (error) {
        console.error("Error parsing pending ratings:", error);
        localStorage.removeItem('pendingRatings');
      }
    }
  }, []);

  // Listen for socket rating requests
  useEffect(() => {
    if (!socket) return;

    // Listen for rating request from server
    const handleRatingRequest = (data) => {
      console.log("Rating request received:", data);
      
      // Check if this rating is already pending
      const isAlreadyPending = pendingRatings.some(rating => 
        rating.rideId === data.rideId && rating.raterType === data.raterType
      );
      
      if (!isAlreadyPending) {
        const updatedPendingRatings = [...pendingRatings, data];
        setPendingRatings(updatedPendingRatings);
        localStorage.setItem('pendingRatings', JSON.stringify(updatedPendingRatings));
        
        if (!isRatingModalOpen) {
          setRatingData(data);
          setIsRatingModalOpen(true);
        }
      }
    };

    socket.on("rating:request", handleRatingRequest);
    socket.on("ride-ended", (data) => {
      // When ride ends, check if we need to create a rating request
      checkRideForRatingRequest(data.rideId);
    });

    return () => {
      socket.off("rating:request", handleRatingRequest);
      socket.off("ride-ended");
    };
  }, [socket, pendingRatings, isRatingModalOpen]);

  // Check if a completed ride needs rating
  const checkRideForRatingRequest = useCallback(async (rideId) => {
    if (!rideId) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ratings/${rideId}/status`,
        { headers: { token } }
      );
      
      const { status, userRated, captainRated } = response.data;
      const userType = localStorage.getItem("userType");
      
      // If ride is completed and current user hasn't rated yet
      if (status === "completed") {
        if ((userType === "user" && !userRated) || (userType === "captain" && !captainRated)) {
          // Get ride details to create rating request
          const rideResponse = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/ride/details/${rideId}`,
            { headers: { token } }
          );
          
          const ride = rideResponse.data;
          const ratingRequestData = {
            rideId,
            raterType: userType,
            ratee: userType === "user" ? {
              name: ride.captain?.fullname?.firstname || "Conductor",
              profileImage: ride.captain?.profileImage || null,
              rating: ride.captain?.rating || { average: 0, count: 0 }
            } : {
              name: ride.user?.fullname?.firstname || "Pasajero",
              profileImage: ride.user?.profileImage || null,
              rating: ride.user?.rating || { average: 0, count: 0 }
            }
          };
          
          // Add to pending ratings
          const isAlreadyPending = pendingRatings.some(rating => 
            rating.rideId === rideId && rating.raterType === userType
          );
          
          if (!isAlreadyPending) {
            const updatedPendingRatings = [...pendingRatings, ratingRequestData];
            setPendingRatings(updatedPendingRatings);
            localStorage.setItem('pendingRatings', JSON.stringify(updatedPendingRatings));
            
            if (!isRatingModalOpen) {
              setRatingData(ratingRequestData);
              setIsRatingModalOpen(true);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking ride for rating:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pendingRatings, isRatingModalOpen]);

  // Handle successful rating submission
  const handleRatingSuccess = useCallback((submittedRideId) => {
    // Remove the submitted rating from pending ratings
    const updatedPendingRatings = pendingRatings.filter(
      rating => !(rating.rideId === submittedRideId && rating.raterType === rating.raterType)
    );
    
    setPendingRatings(updatedPendingRatings);
    localStorage.setItem('pendingRatings', JSON.stringify(updatedPendingRatings));
    
    // Check if there are more pending ratings
    if (updatedPendingRatings.length > 0) {
      setRatingData(updatedPendingRatings[0]);
      // Keep modal open for next rating
    } else {
      closeRatingModal();
    }
  }, [pendingRatings]);

  // Close rating modal and handle next pending rating if available
  const closeRatingModal = useCallback(() => {
    setIsRatingModalOpen(false);
    setRatingData(null);
    
    // Check if there are more pending ratings
    if (pendingRatings.length > 1) {
      setTimeout(() => {
        setRatingData(pendingRatings[1]);
        setIsRatingModalOpen(true);
      }, 500);
    }
  }, [pendingRatings]);

  return {
    isRatingModalOpen,
    ratingData,
    pendingRatings,
    isLoading,
    closeRatingModal,
    handleRatingSuccess,
    checkRideForRatingRequest
  };
}
