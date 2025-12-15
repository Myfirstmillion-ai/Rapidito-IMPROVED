import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  MessageSquare, 
  X, 
  ChevronUp, 
  ChevronDown,
  User,
  DollarSign,
  Shield,
  CheckCircle2
} from 'lucide-react';

/**
 * ActiveRideHUD - Minimal Heads-Up Display for Active Rides
 * 
 * Design Philosophy: Aviation HUD meets Tesla Dashboard
 * Core Principle: Critical info at a glance, minimal distraction
 * 
 * States:
 * - NAVIGATING_TO_PICKUP: Show route to pickup, OTP input
 * - WAITING_FOR_PASSENGER: OTP verification
 * - IN_RIDE: Show route to destination, End Ride button
 */

const CAPTAIN_COLORS = {
  background: '#000000',
  surface: '#1A1A1A',
  elevated: '#2A2A2A',
  online: '#10B981',
  offline: '#6B7280',
  busy: '#F59E0B',
  warning: '#EF4444',
  glass: 'rgba(0, 0, 0, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

const RIDE_STATUS = {
  NAVIGATING_TO_PICKUP: 'navigating_to_pickup',
  WAITING_FOR_OTP: 'waiting_for_otp',
  IN_RIDE: 'in_ride'
};

function ActiveRideHUD({
  rideData,
  rideStatus = RIDE_STATUS.NAVIGATING_TO_PICKUP,
  otp,
  onOtpChange,
  onVerifyOtp,
  onEndRide,
  onCancelRide,
  onCall,
  onMessage,
  loading = false,
  error = '',
  unreadMessages = 0
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Spring animation config
  const springConfig = {
    type: "spring",
    damping: 30,
    stiffness: 300
  };

  // Get user initials
  const userInitials = useMemo(() => {
    const first = rideData?.user?.fullname?.firstname?.[0] || '';
    const last = rideData?.user?.fullname?.lastname?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  }, [rideData]);

  // Format fare
  const formattedFare = useMemo(() => {
    const fare = rideData?.fare || 0;
    return `COP$ ${fare.toLocaleString('es-CO')}`;
  }, [rideData]);

  // Get status-specific content
  const getStatusContent = () => {
    switch (rideStatus) {
      case RIDE_STATUS.NAVIGATING_TO_PICKUP:
        return {
          title: 'Hacia el pasajero',
          subtitle: rideData?.pickup?.split(',')[0] || 'Recogida',
          icon: Navigation,
          color: CAPTAIN_COLORS.online,
          action: null
        };
      case RIDE_STATUS.WAITING_FOR_OTP:
        return {
          title: 'Verificar código',
          subtitle: 'Solicita el código al pasajero',
          icon: Shield,
          color: CAPTAIN_COLORS.busy,
          action: 'otp'
        };
      case RIDE_STATUS.IN_RIDE:
        return {
          title: 'En viaje',
          subtitle: rideData?.destination?.split(',')[0] || 'Destino',
          icon: MapPin,
          color: '#60A5FA',
          action: 'end'
        };
      default:
        return {
          title: 'Viaje activo',
          subtitle: '',
          icon: Navigation,
          color: CAPTAIN_COLORS.online,
          action: null
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={prefersReducedMotion ? {} : { y: 100, opacity: 0 }}
      transition={springConfig}
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Main HUD Container */}
      <div 
        className="mx-3 mb-3 rounded-[24px] overflow-hidden"
        style={{
          background: CAPTAIN_COLORS.glass,
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: `1px solid ${CAPTAIN_COLORS.glassBorder}`,
          boxShadow: '0 -4px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Status indicator bar at top */}
        <div 
          className="h-1"
          style={{ background: `linear-gradient(90deg, ${statusContent.color}, ${statusContent.color}80)` }}
        />

        {/* Compact Header - Always visible */}
        <div 
          className="px-4 py-3 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${statusContent.color}20` }}
            >
              <statusContent.icon className="w-5 h-5" style={{ color: statusContent.color }} />
            </div>

            {/* Status Text */}
            <div>
              <p className="text-white font-bold">{statusContent.title}</p>
              <p className="text-white/50 text-sm truncate max-w-[180px]">{statusContent.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Fare Badge */}
            <div 
              className="px-3 py-1.5 rounded-full"
              style={{ background: CAPTAIN_COLORS.surface }}
            >
              <span className="text-white font-bold text-sm">${Math.floor(rideData?.fare / 1000)}K</span>
            </div>

            {/* Expand/Collapse Icon */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className="w-5 h-5 text-white/50" />
            </motion.div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                {/* Passenger Info Card */}
                <div 
                  className="rounded-2xl p-4 mb-3"
                  style={{ background: CAPTAIN_COLORS.surface }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Passenger Avatar */}
                      {rideData?.user?.profileImage ? (
                        <img
                          src={rideData.user.profileImage}
                          alt="Passenger"
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ background: `linear-gradient(135deg, ${CAPTAIN_COLORS.online}, #059669)` }}
                        >
                          {userInitials}
                        </div>
                      )}

                      <div>
                        <p className="text-white font-bold">
                          {rideData?.user?.fullname?.firstname} {rideData?.user?.fullname?.lastname?.[0]}.
                        </p>
                        {rideData?.user?.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-sm">★</span>
                            <span className="text-white/60 text-sm">{rideData.user.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onMessage?.(rideData?._id)}
                        className="relative w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: CAPTAIN_COLORS.elevated }}
                      >
                        <MessageSquare className="w-5 h-5 text-white" />
                        {unreadMessages > 0 && (
                          <span 
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: CAPTAIN_COLORS.warning }}
                          >
                            {unreadMessages}
                          </span>
                        )}
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCall?.(rideData?.user?.phone)}
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: CAPTAIN_COLORS.online }}
                      >
                        <Phone className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* OTP Input Section */}
                {rideStatus === RIDE_STATUS.WAITING_FOR_OTP && (
                  <div className="mb-3">
                    <p className="text-white/50 text-sm mb-2 text-center">Ingresa el código de 6 dígitos</p>
                    <input
                      type="number"
                      value={otp}
                      onChange={(e) => onOtpChange?.(e.target.value)}
                      placeholder="• • • • • •"
                      maxLength={6}
                      className="w-full py-4 px-4 rounded-2xl text-center text-2xl font-bold tracking-[0.5em] text-white outline-none transition-all"
                      style={{ 
                        background: CAPTAIN_COLORS.elevated,
                        border: `2px solid ${error ? CAPTAIN_COLORS.warning : CAPTAIN_COLORS.glassBorder}`,
                        caretColor: CAPTAIN_COLORS.online
                      }}
                    />
                    {error && (
                      <p className="text-center mt-2 text-sm font-medium" style={{ color: CAPTAIN_COLORS.warning }}>
                        {error}
                      </p>
                    )}
                  </div>
                )}

                {/* Route Display */}
                <div 
                  className="rounded-2xl p-3 mb-3"
                  style={{ background: CAPTAIN_COLORS.elevated }}
                >
                  {/* Pickup */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: CAPTAIN_COLORS.online }} />
                    <p className="text-white/70 text-sm flex-1 truncate">
                      {rideData?.pickup?.split(',')[0]}
                    </p>
                  </div>

                  {/* Destination */}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-3 h-3" style={{ color: CAPTAIN_COLORS.warning }} />
                    <p className="text-white text-sm font-medium flex-1 truncate">
                      {rideData?.destination?.split(',')[0]}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {/* Cancel Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancelRide}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-white/70 flex items-center justify-center gap-2 transition-colors"
                    style={{ background: CAPTAIN_COLORS.elevated }}
                  >
                    <X className="w-5 h-5" />
                    <span>Cancelar</span>
                  </motion.button>

                  {/* Primary Action Button */}
                  {rideStatus === RIDE_STATUS.WAITING_FOR_OTP ? (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={onVerifyOtp}
                      disabled={loading || !otp || otp.length < 6}
                      className="flex-[2] py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ 
                        background: `linear-gradient(135deg, ${CAPTAIN_COLORS.busy}, #D97706)`,
                        boxShadow: `0 4px 20px ${CAPTAIN_COLORS.busy}40`
                      }}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          <span>Verificar OTP</span>
                        </>
                      )}
                    </motion.button>
                  ) : rideStatus === RIDE_STATUS.IN_RIDE ? (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={onEndRide}
                      disabled={loading}
                      className="flex-[2] py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ 
                        background: `linear-gradient(135deg, ${CAPTAIN_COLORS.online}, #059669)`,
                        boxShadow: `0 4px 20px ${CAPTAIN_COLORS.online}40`
                      }}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Finalizar Viaje</span>
                        </>
                      )}
                    </motion.button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ActiveRideHUD;
export { RIDE_STATUS };
