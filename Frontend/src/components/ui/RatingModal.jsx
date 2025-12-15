import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, User, MessageSquare, X, Frown, Meh, Smile, SmileBeam } from "lucide-react";
import { cn } from "../../utils/cn";
import axios from "axios";
import toast from "react-hot-toast";
import { colors, shadows, glassEffect, borderRadius } from "../../styles/designSystem";
import { springs } from "../../utils/animationUtils";

/**
 * Rating Modal Component - UBER Style
 * 
 * Features:
 * - Appears automatically when ride completes
 * - Cannot be closed until rating is submitted
 * - 5-star rating system with hover effects
 * - Optional comment field (max 250 chars)
 * - Avatar and rating display of ratee
 * - Smooth animations
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Object} props.rideData - Ride and ratee information
 * @param {Function} props.onSubmit - Callback after successful submission
 */
function RatingModal({ isOpen, rideData, onSubmit }) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStars, setSelectedStars] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleStarClick = (star) => {
    setSelectedStars(star);
  };

  const handleSubmit = async () => {
    if (selectedStars === 0) {
      toast.error("Por favor selecciona una calificación");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      
      // Debug: Log token to verify it exists
      console.log('Token en submit:', token ? 'Token presente' : 'Token ausente');
      
      if (!token) {
        toast.error("Sesión expirada. Por favor inicia sesión nuevamente");
        setIsSubmitting(false);
        return;
      }

      // Prepare the payload with explicit rateeId
      const payload = {
        rideId: rideData.rideId,
        stars: selectedStars,
        comment: comment.trim(),
        raterType: rideData.raterType,
        // Explicitly pass rateeId from rideData
        rateeId: rideData.rateeId || rideData.userId || rideData.captainId,
      };

      console.log('Rating payload:', payload);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ratings/submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Rating submitted successfully:", response.data);
      toast.success("¡Gracias por tu calificación!");
      
      // Call onSubmit callback
      if (onSubmit) {
        onSubmit();
      }

      // Reset form
      setSelectedStars(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting rating:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || "Error al enviar calificación";
      const errorReason = error.response?.data?.reason;
      
      if (error.response?.status === 401) {
        toast.error("Sesión expirada. Por favor inicia sesión nuevamente");
      } else if (error.response?.status === 403) {
        toast.error(errorReason || errorMessage);
      } else if (error.response?.status === 400) {
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Defensive check for malformed data - prevents crash on missing nested properties
  if (!rideData || !rideData.ratee || !rideData.ratee.name) {
    console.warn("RatingModal: Missing required rideData or ratee information");
    return null;
  }

  // Safe getter for initials with fallback
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || '?';
  };

  // Rating label based on selected stars
  const getRatingLabel = () => {
    switch (selectedStars) {
      case 1: return "Muy malo";
      case 2: return "Malo";
      case 3: return "Regular";
      case 4: return "Bueno";
      case 5: return "Excelente";
      default: return "Toca para calificar";
    }
  };
  
  // Rating icon based on selected stars
  const getRatingIcon = () => {
    switch (selectedStars) {
      case 1: return <Frown size={32} className="text-red-500" />;
      case 2: return <Frown size={32} className="text-orange-500" />;
      case 3: return <Meh size={32} className="text-yellow-500" />;
      case 4: return <Smile size={32} className="text-emerald-500" />;
      case 5: return <SmileBeam size={32} className="text-emerald-500" />;
      default: return null;
    }
  };
  
  // Haptic feedback function
  const triggerHaptic = (intensity = 'light') => {
    if (navigator.vibrate) {
      const patterns = {
        light: [5],
        medium: [10],
        heavy: [15],
      };
      navigator.vibrate(patterns[intensity]);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - iOS Deluxe fade with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()} // Prevent close on overlay click
          />

          {/* Modal with iOS Deluxe Glassmorphism - Bottom sheet on mobile, centered on desktop */}
          <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center sm:justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={springs.default}
              className="relative w-full max-w-[480px] p-0 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col"
              style={{
                ...glassEffect,
                boxShadow: shadows.xl
              }}
            >
              {/* Handle bar for bottom sheet */}
              <div className="w-full flex justify-center py-3 sm:hidden">
                <div className="w-12 h-1 bg-white/20 rounded-full"></div>
              </div>
              
              {/* Profile photo and details */}
              <div className="flex flex-col items-center p-6">
                <div className="relative w-20 h-20 mb-4">
                  {rideData.ratee.profileImage ? (
                    <motion.img
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={springs.snappy}
                      src={rideData.ratee.profileImage}
                      alt={rideData.ratee.name}
                      className="w-20 h-20 rounded-full object-cover shadow-lg border-4 border-white/20"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={springs.snappy}
                    className={`w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center shadow-lg border-4 border-white/20 ${rideData.ratee.profileImage ? 'hidden' : 'flex'}`}
                  >
                    <span className="text-3xl font-black text-white">
                      {getInitials(rideData.ratee.name)}
                    </span>
                  </motion.div>
                </div>
                
                {/* Name and rating */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springs.snappy, delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <h3 className="text-xl font-bold text-white">
                    {rideData.ratee.name}
                  </h3>
                  {rideData.ratee.rating && rideData.ratee.rating.count > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm text-white/70">
                        {rideData.ratee.rating.average.toFixed(1)} · {rideData.ratee.rating.count} {rideData.ratee.rating.count === 1 ? 'calificación' : 'calificaciones'}
                      </span>
                    </div>
                  )}
                </motion.div>
                
                {/* Subtle divider */}
                <div className="w-full h-px bg-white/10 mt-6"></div>
              </div>

              {/* Star Rating System - iOS Deluxe style */}
              <div className="px-6 pb-6">
                <h2 className="text-2xl font-bold text-white text-center mb-1">
                  ¿Cómo fue tu viaje?
                </h2>
                <p className="text-white/60 text-sm text-center mb-6">
                  {getRatingLabel()}
                </p>
                
                <div className="flex justify-center gap-4 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => {
                        handleStarClick(star);
                        triggerHaptic('medium');
                      }}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={springs.bounce}
                      className="focus:outline-none rounded-full p-1"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={48}
                        className={cn(
                          "drop-shadow-lg transition-all duration-300",
                          star <= (hoveredStar || selectedStars)
                            ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                            : "text-white/30 fill-white/5"
                        )}
                      />
                    </motion.button>
                  ))}
                </div>
                
                {/* Rating descriptor with icon */}
                <AnimatePresence mode="wait">
                  {selectedStars > 0 && (
                    <motion.div 
                      key={selectedStars}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2 text-white/70 mb-6"
                    >
                      {getRatingIcon()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Comment Section - iOS Deluxe style */}
              <div className="px-6 pb-4">
                <div className="relative">
                  <div className="absolute top-4 left-4 text-white/40">
                    <MessageSquare size={20} />
                  </div>
                  
                  <textarea
                    value={comment}
                    onChange={(e) => {
                      if (e.target.value.length <= 250) {
                        setComment(e.target.value);
                      }
                    }}
                    placeholder="Cuéntanos más sobre tu experiencia (opcional)"
                    className="w-full min-h-[120px] p-4 pl-12 border border-white/20 bg-white/5 backdrop-blur-sm rounded-2xl resize-none focus:outline-none focus:border-white/30 text-white placeholder-white/40 transition-colors"
                    maxLength={250}
                  />
                  
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-white/50">
                      {comment.length}/250
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons - iOS Deluxe style */}
              <div className="px-6 pb-8">
                {/* Submit Button */}
                <motion.button
                  onClick={() => {
                    handleSubmit();
                    triggerHaptic('heavy');
                  }}
                  disabled={isSubmitting || selectedStars === 0}
                  whileHover={selectedStars > 0 ? { scale: 1.02, y: -1 } : {}}
                  whileTap={selectedStars > 0 ? { scale: 0.98 } : {}}
                  transition={springs.snappy}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-white",
                    "h-14 flex items-center justify-center",
                    "focus:outline-none",
                    selectedStars === 0
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-[#10B981] text-white shadow-lg shadow-emerald-500/20"
                  )}
                >
                  {isSubmitting ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Enviar Calificación"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default RatingModal;
