import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, DollarSign, Clock, X, Check, User } from 'lucide-react';

/**
 * RideRequestCard - Dynamic Island-Style Ride Request Notification
 * 
 * Design Philosophy: iOS Dynamic Island meets Aviation HUD
 * Core Principle: Critical info at a glance, instant action
 * 
 * Features:
 * - Morphs from compact pill to expanded card
 * - Auto-countdown timer
 * - Haptic feedback simulation via animation
 * - Premium glassmorphism on pure black
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

function RideRequestCard({
  rideData,
  isVisible = false,
  onAccept,
  onReject,
  timeoutSeconds = 30
}) {
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Countdown timer
  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(timeoutSeconds);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, timeoutSeconds, onReject]);

  // Auto-expand after 1 second
  useEffect(() => {
    if (isVisible) {
      const expandTimer = setTimeout(() => setIsExpanded(true), 500);
      return () => clearTimeout(expandTimer);
    } else {
      setIsExpanded(false);
    }
  }, [isVisible]);

  // Get user initials
  const userInitials = useMemo(() => {
    const first = rideData?.user?.fullname?.firstname?.[0] || '';
    const last = rideData?.user?.fullname?.lastname?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  }, [rideData]);

  // Format fare
  const formattedFare = useMemo(() => {
    const fare = rideData?.fare || 0;
    if (fare >= 1000) {
      return `$${Math.floor(fare / 1000)}K`;
    }
    return `$${fare}`;
  }, [rideData]);

  // Format distance
  const formattedDistance = useMemo(() => {
    const distance = rideData?.distance || 0;
    return `${(distance / 1000).toFixed(1)} km`;
  }, [rideData]);

  // Calculate progress for circular timer
  const progress = (timeLeft / timeoutSeconds) * 100;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? {} : { y: -100, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={prefersReducedMotion ? {} : { y: -100, opacity: 0, scale: 0.8 }}
        transition={springConfig}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
      >
        <motion.div
          layout
          className="mx-4 w-full max-w-md overflow-hidden"
          style={{
            background: CAPTAIN_COLORS.glass,
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: `1px solid ${CAPTAIN_COLORS.glassBorder}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            borderRadius: isExpanded ? '28px' : '50px'
          }}
        >
          {/* Pulsing border animation */}
          <motion.div
            animate={{ 
              boxShadow: [
                `0 0 0 0 ${CAPTAIN_COLORS.online}00`,
                `0 0 0 4px ${CAPTAIN_COLORS.online}40`,
                `0 0 0 0 ${CAPTAIN_COLORS.online}00`
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-[28px] pointer-events-none"
            style={{ borderRadius: isExpanded ? '28px' : '50px' }}
          />

          <div className="relative p-4">
            {/* Compact View (Dynamic Island Pill) */}
            <AnimatePresence mode="wait">
              {!isExpanded ? (
                <motion.div
                  key="compact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between gap-3"
                  onClick={() => setIsExpanded(true)}
                >
                  {/* User Avatar */}
                  <div className="relative">
                    {rideData?.user?.profileImage ? (
                      <img
                        src={rideData.user.profileImage}
                        alt="Passenger"
                        loading="lazy"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: CAPTAIN_COLORS.online }}
                      >
                        {userInitials}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center">
                    <p className="text-white font-semibold">
                      {rideData?.user?.fullname?.firstname || 'Nuevo viaje'}
                    </p>
                    <p className="text-white/50 text-sm">{formattedFare} • {formattedDistance}</p>
                  </div>

                  {/* Timer */}
                  <CircularTimer progress={progress} timeLeft={timeLeft} size={40} />
                </motion.div>
              ) : (
                /* Expanded View */
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* User Avatar */}
                      {rideData?.user?.profileImage ? (
                        <img
                          src={rideData.user.profileImage}
                          alt="Passenger"
                          loading="lazy"
                          className="w-14 h-14 rounded-2xl object-cover border-2"
                          style={{ borderColor: CAPTAIN_COLORS.online }}
                        />
                      ) : (
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl border-2"
                          style={{ 
                            background: `linear-gradient(135deg, ${CAPTAIN_COLORS.online} 0%, #059669 100%)`,
                            borderColor: CAPTAIN_COLORS.online
                          }}
                        >
                          {userInitials}
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          {rideData?.user?.fullname?.firstname} {rideData?.user?.fullname?.lastname?.[0]}.
                        </h3>
                        <div className="flex items-center gap-1.5">
                          {rideData?.user?.rating && (
                            <>
                              <span className="text-yellow-400 text-sm">★</span>
                              <span className="text-white/60 text-sm">{rideData.user.rating.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timer */}
                    <CircularTimer progress={progress} timeLeft={timeLeft} size={56} />
                  </div>

                  {/* Route Info */}
                  <div 
                    className="rounded-2xl p-4 mb-4"
                    style={{ background: CAPTAIN_COLORS.surface }}
                  >
                    {/* Pickup */}
                    <div className="flex items-start gap-3 mb-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${CAPTAIN_COLORS.online}20` }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ background: CAPTAIN_COLORS.online }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Recogida</p>
                        <p className="text-white font-medium text-sm truncate">
                          {rideData?.pickup?.split(',')[0] || 'Cargando...'}
                        </p>
                      </div>
                    </div>

                    {/* Connector */}
                    <div className="ml-4 flex flex-col gap-0.5 my-1">
                      <div className="w-0.5 h-1 rounded-full bg-white/20" />
                      <div className="w-0.5 h-1 rounded-full bg-white/15" />
                      <div className="w-0.5 h-1 rounded-full bg-white/10" />
                    </div>

                    {/* Destination */}
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${CAPTAIN_COLORS.warning}20` }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: CAPTAIN_COLORS.warning }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Destino</p>
                        <p className="text-white font-medium text-sm truncate">
                          {rideData?.destination?.split(',')[0] || 'Cargando...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="flex items-center justify-center gap-6 mb-4">
                    <MetricBadge icon={DollarSign} value={formattedFare} label="TARIFA" color={CAPTAIN_COLORS.online} />
                    <MetricBadge icon={Navigation} value={formattedDistance} label="DISTANCIA" color="#60A5FA" />
                    <MetricBadge icon={Clock} value={`${rideData?.duration || 0} min`} label="TIEMPO" color={CAPTAIN_COLORS.busy} />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onReject}
                      className="flex-1 py-3.5 rounded-2xl font-bold text-white/70 flex items-center justify-center gap-2 transition-colors"
                      style={{ background: CAPTAIN_COLORS.elevated }}
                    >
                      <X className="w-5 h-5" />
                      <span>Ignorar</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onAccept}
                      className="flex-[2] py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                      style={{ 
                        background: `linear-gradient(135deg, ${CAPTAIN_COLORS.online} 0%, #059669 100%)`,
                        boxShadow: `0 4px 20px ${CAPTAIN_COLORS.online}40`
                      }}
                    >
                      <Check className="w-5 h-5" />
                      <span>Aceptar Viaje</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * CircularTimer - Apple Watch style countdown
 */
function CircularTimer({ progress, timeLeft, size = 56 }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isUrgent = timeLeft <= 10;
  const color = isUrgent ? CAPTAIN_COLORS.warning : CAPTAIN_COLORS.online;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-white font-bold"
          style={{ 
            fontSize: size > 50 ? '18px' : '14px',
            color: isUrgent ? CAPTAIN_COLORS.warning : '#FFFFFF'
          }}
        >
          {timeLeft}
        </motion.span>
      </div>
    </div>
  );
}

/**
 * MetricBadge - Aviation HUD style metric display
 */
function MetricBadge({ icon: Icon, value, label, color }) {
  return (
    <div className="text-center">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1"
        style={{ background: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-white font-bold text-sm">{value}</p>
      <p className="text-white/40 text-[10px] uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default RideRequestCard;
