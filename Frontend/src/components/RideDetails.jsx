import { useState, useEffect, useMemo } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import {
  MapPinMinus,
  MapPinPlus,
  PhoneCall,
  MessageSquare,
  Navigation,
  Clock,
  User,
  CreditCard,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import MessageBadge from "./ui/MessageBadge";

/**
 * 🏆 TESLA MATTE PREMIUM - RideDetails Component
 * 
 * Design System: $100K Premium UI
 * - Floating Islands detached from edges (16px margin)
 * - Matte Black surfaces (NO transparency/blur)
 * - Bento Grid data organization
 * - Monochromatic palette (black/white/gray + emerald accent)
 * - Physics-based spring interactions
 * - Typography-driven hierarchy
 * 
 * Elevation System:
 * Level 0: Background (#000000)
 * Level 1: Cards (#0A0A0A)
 * Level 2: Elevated (#1C1C1E)  
 * Level 3: Interactive (#2C2C2E)
 */

// Tesla Matte Color System
const TESLA_COLORS = {
  bg: '#000000',           // Pure black background
  surface_1: '#0A0A0A',    // Matte cards
  surface_2: '#1C1C1E',    // Elevated elements
  surface_3: '#2C2C2E',    // Interactive states
  text_primary: '#FFFFFF',
  text_secondary: '#8E8E93',
  text_tertiary: '#636366',
  accent: '#10B981',       // Emerald (only accent color)
  divider: '#38383A',
};

// Physics Spring Configuration (60fps smooth)
const SPRING_CONFIG = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

// Haptic feedback simulation
const triggerHaptic = (intensity = 'light') => {
  if (navigator.vibrate) {
    const patterns = {
      light: [5],
      medium: [10],
      heavy: [15],
    };
    navigator.vibrate(patterns[intensity] || patterns.light);
  }
};

function RideDetails({
  pickupLocation,
  destinationLocation,
  selectedVehicle,
  paymentMethod = "cash",
  fare,
  showPanel,
  setShowPanel,
  showPreviousPanel,
  createRide,
  cancelRide,
  loading,
  rideCreated,
  confirmedRideData,
  unreadMessages = 0,
}) {
  const [dragY, setDragY] = useState(0);
  const springY = useSpring(0, SPRING_CONFIG);
  const opacity = useTransform(springY, [0, 300], [1, 0]);

  // Check for reduced motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  // Vehicle display name
  const vehicleDisplay = selectedVehicle === "car" ? "Carro" : "Moto";

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { y: '100%', opacity: 0 }}
      animate={{ 
        y: showPanel ? 0 : '100%',
        opacity: showPanel ? 1 : 0,
      }}
      transition={SPRING_CONFIG}
      className="fixed inset-0 z-50 pointer-events-none"
    >
      {/* Overlay */}
      {showPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPanel(false)}
          className="absolute inset-0 pointer-events-auto"
          style={{ background: 'rgba(0, 0, 0, 0.6)' }}
        />
      )}

      {/* Floating Island Container - Detached from edges */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-auto"
        style={{ 
          padding: '16px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.y > 150 || velocity.y > 500) {
              setShowPanel(false);
              triggerHaptic('light');
            }
          }}
          style={{ 
            y: springY,
            opacity: opacity,
          }}
          className="overflow-hidden"
          // Matte Black Island with elevation shadow
          css={{
            background: TESLA_COLORS.surface_1,
            borderRadius: '32px',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <motion.div 
              whileHover={{ scale: 1.2 }}
              className="w-12 h-1.5 rounded-full"
              style={{ background: TESLA_COLORS.divider }}
            />
          </div>

          {/* Scrollable Content */}
          <div 
            className="px-4 pb-4 overflow-y-auto"
            style={{ maxHeight: 'calc(85vh - 100px)' }}
          >
            {/* Back Button - Floating Island */}
            {!rideCreated && !confirmedRideData && showPreviousPanel && (
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                onTapStart={() => triggerHaptic('light')}
                onClick={() => {
                  setShowPanel(false);
                  showPreviousPanel(true);
                }}
                className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-full"
                style={{
                  background: TESLA_COLORS.surface_2,
                  color: TESLA_COLORS.text_secondary,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                }}
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
                <span className="text-sm font-semibold">Cambiar vehículo</span>
              </motion.button>
            )}

            {/* Loading State - Radar Animation */}
            {rideCreated && !confirmedRideData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 rounded-3xl p-6 relative overflow-hidden"
                style={{ background: TESLA_COLORS.surface_2 }}
              >
                {/* Radar pulse effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 2, 2],
                      opacity: [0.5, 0.2, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    className="w-24 h-24 rounded-full border-2"
                    style={{ borderColor: TESLA_COLORS.accent }}
                  />
                </div>

                {/* Loading content */}
                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: `${TESLA_COLORS.accent}20` }}
                  >
                    <Loader2 size={32} style={{ color: TESLA_COLORS.accent }} />
                  </motion.div>
                  <p className="text-base font-semibold" style={{ color: TESLA_COLORS.text_primary }}>
                    Conectando con conductores
                  </p>
                  <p className="text-sm mt-1" style={{ color: TESLA_COLORS.text_secondary }}>
                    Esto puede tomar unos segundos
                  </p>
                </div>
              </motion.div>
            )}

            {/* Bento Grid - Driver Info (when confirmed) */}
            {confirmedRideData?._id && (
              <div className="mb-4 rounded-3xl p-5" style={{ background: TESLA_COLORS.surface_2 }}>
                {/* Driver Profile - Monochromatic Hierarchy */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {confirmedRideData.captain?.profileImage ? (
                      <img 
                        src={confirmedRideData.captain.profileImage}
                        alt="Conductor"
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: TESLA_COLORS.surface_3 }}
                      >
                        <User size={28} style={{ color: TESLA_COLORS.text_secondary }} />
                      </div>
                    )}
                    {/* Status indicator */}
                    <div 
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2"
                      style={{ 
                        background: TESLA_COLORS.accent,
                        borderColor: TESLA_COLORS.surface_2,
                      }}
                    />
                  </div>

                  {/* Driver Info - Typography Hierarchy */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: TESLA_COLORS.text_tertiary }}>
                      Tu conductor
                    </p>
                    <h3 className="text-xl font-bold truncate" style={{ color: TESLA_COLORS.text_primary }}>
                      {confirmedRideData.captain?.fullname?.firstname}{" "}
                      {confirmedRideData.captain?.fullname?.lastname}
                    </h3>
                    {confirmedRideData.captain?.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <span style={{ color: TESLA_COLORS.accent }}>★</span>
                        <span className="text-sm font-semibold" style={{ color: TESLA_COLORS.text_secondary }}>
                          {confirmedRideData.captain.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Info - Bento Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Price Info */}
                  <div className="rounded-2xl p-3" style={{ background: TESLA_COLORS.surface_3 }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: TESLA_COLORS.text_tertiary }}>
                      Precio
                    </p>
                    <p className="text-sm font-bold" style={{ color: TESLA_COLORS.text_primary }}>
                      ${fare?.[selectedVehicle]?.toLocaleString('es-CO') || "--"}
                    </p>
                  </div>
                  
                  {/* Payment Method (before ride is confirmed) */}
                  <div className="rounded-2xl p-3" style={{ background: TESLA_COLORS.surface_3 }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: TESLA_COLORS.text_tertiary }}>
                      Pago
                    </p>
                    <div className="flex items-center gap-2">
                      {paymentMethod === "nequi" ? (
                        <>
                          <img 
                            src="/payment-icons/nequi-logo.svg" 
                            alt="Nequi" 
                            className="w-5 h-5"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'block';
                            }}
                          />
                          <span className="hidden text-sm font-bold" style={{ color: "#61108C" }}>N</span>
                        </>
                      ) : (
                        <CreditCard size={18} style={{ color: TESLA_COLORS.accent }} />
                      )}
                      <p className="text-sm font-bold" style={{ color: TESLA_COLORS.text_primary }}>
                        {paymentMethod === "nequi" ? "Nequi" : "Efectivo"}
                      </p>
                    </div>
                  </div>

                  {/* Color */}
                  <div className="rounded-2xl p-3" style={{ background: TESLA_COLORS.surface_3 }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: TESLA_COLORS.text_tertiary }}>
                      Color
                    </p>
                    <p className="text-sm font-bold" style={{ color: TESLA_COLORS.text_primary }}>
                      {confirmedRideData.captain?.vehicle?.color || "N/A"}
                    </p>
                  </div>
                  
                  {/* Payment Method */}
                  <div className="rounded-2xl p-3 col-span-2" style={{ background: TESLA_COLORS.surface_3 }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: TESLA_COLORS.text_tertiary }}>
                      Método de pago
                    </p>
                    <div className="flex items-center gap-2">
                      {confirmedRideData.paymentMethod === "nequi" ? (
                        <>
                          <img 
                            src="/payment-icons/nequi-logo.svg" 
                            alt="Nequi" 
                            className="w-5 h-5"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'block';
                            }}
                          />
                          <span className="hidden text-sm font-bold" style={{ color: "#61108C" }}>N</span>
                        </>
                      ) : (
                        <CreditCard size={18} style={{ color: TESLA_COLORS.accent }} />
                      )}
                      <p className="text-sm font-bold" style={{ color: TESLA_COLORS.text_primary }}>
                        {confirmedRideData.paymentMethod === "nequi" ? "Nequi" : "Efectivo"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* License Plate - High Contrast Island */}
                <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: TESLA_COLORS.bg }}>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: TESLA_COLORS.text_tertiary }}>
                      Placa
                    </p>
                    <p className="text-xs" style={{ color: TESLA_COLORS.accent }}>
                      Verifica antes de abordar
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-xl" style={{ background: TESLA_COLORS.text_primary }}>
                    <span className="text-2xl font-black tracking-widest" style={{ color: TESLA_COLORS.bg }}>
                      {confirmedRideData.captain?.vehicle?.number || "---"}
                    </span>
                  </div>
                </div>

                {/* OTP Code - Accent Island */}
                <div className="mt-3 rounded-2xl p-4 flex items-center justify-between" style={{ background: `${TESLA_COLORS.accent}15` }}>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: TESLA_COLORS.accent }}>
                      Código de verificación
                    </p>
                    <p className="text-xs" style={{ color: TESLA_COLORS.text_secondary }}>
                      Muéstralo al conductor
                    </p>
                  </div>
                  <div className="px-5 py-3 rounded-xl" style={{ background: TESLA_COLORS.surface_3 }}>
                    <span className="text-2xl font-black tracking-wider" style={{ color: TESLA_COLORS.text_primary }}>
                      {confirmedRideData.otp}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Actions - Physics Buttons */}
            {confirmedRideData?._id && (
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <motion.a
                    href={`/user/chat/${confirmedRideData._id}`}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                    onTapStart={() => triggerHaptic('medium')}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold"
                    style={{
                      background: TESLA_COLORS.surface_2,
                      color: TESLA_COLORS.text_primary,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <MessageSquare size={20} strokeWidth={2} />
                    <span>Mensaje</span>
                  </motion.a>
                  {unreadMessages > 0 && <MessageBadge count={unreadMessages} />}
                </div>

                <motion.a
                  href={`tel:${confirmedRideData.captain?.phone}`}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  onTapStart={() => triggerHaptic('medium')}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl"
                  style={{
                    background: TESLA_COLORS.accent,
                    boxShadow: `0 4px 12px ${TESLA_COLORS.accent}40`,
                  }}
                >
                  <PhoneCall size={22} strokeWidth={2.5} style={{ color: TESLA_COLORS.text_primary }} />
                </motion.a>
              </div>
            )}

            {/* Route Display - Matte Card */}
            <div className="rounded-3xl p-4 mb-4" style={{ background: TESLA_COLORS.surface_2 }}>
              {/* Pickup */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${TESLA_COLORS.accent}20` }}>
                  <MapPinMinus size={16} style={{ color: TESLA_COLORS.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: TESLA_COLORS.text_tertiary }}>
                    Recogida
                  </p>
                  <p className="text-sm font-semibold truncate" style={{ color: TESLA_COLORS.text_primary }}>
                    {pickupLocation?.split(", ")[0]}
                  </p>
                </div>
              </div>

              {/* Connector dots */}
              <div className="flex flex-col gap-1 pl-4 py-2">
                <div className="w-1 h-1 rounded-full" style={{ background: TESLA_COLORS.divider }} />
                <div className="w-1 h-1 rounded-full" style={{ background: TESLA_COLORS.divider }} />
                <div className="w-1 h-1 rounded-full" style={{ background: TESLA_COLORS.divider }} />
              </div>

              {/* Destination */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: TESLA_COLORS.surface_3 }}>
                  <MapPinPlus size={16} style={{ color: TESLA_COLORS.text_secondary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: TESLA_COLORS.text_tertiary }}>
                    Destino
                  </p>
                  <p className="text-sm font-semibold truncate" style={{ color: TESLA_COLORS.text_primary }}>
                    {destinationLocation?.split(", ")[0]}
                  </p>
                </div>
              </div>

              {/* Fare - Monochromatic Divider + Bold Typography */}
              <div className="flex items-center justify-between pt-4 mt-4" style={{ borderTop: `1px solid ${TESLA_COLORS.divider}` }}>
                <div className="flex items-center gap-2">
                  <CreditCard size={18} style={{ color: TESLA_COLORS.text_tertiary }} />
                  <span className="text-sm font-medium" style={{ color: TESLA_COLORS.text_secondary }}>
                    Efectivo
                  </span>
                </div>
                <h2 className="text-3xl font-black" style={{ color: TESLA_COLORS.text_primary }}>
                  {formatCurrency(fare?.[selectedVehicle])}
                </h2>
              </div>
            </div>

            {/* Action Buttons - Physics-based */}
            <div className="space-y-3">
              {rideCreated || confirmedRideData ? (
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
                  onTapStart={() => triggerHaptic('heavy')}
                  onClick={cancelRide}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                  style={{
                    background: '#DC2626',
                    color: TESLA_COLORS.text_primary,
                    boxShadow: '0 4px 16px rgba(220, 38, 38, 0.4)',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <span>Cancelar Viaje</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
                  onTapStart={() => triggerHaptic('heavy')}
                  onClick={createRide}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                  style={{
                    background: TESLA_COLORS.accent,
                    color: TESLA_COLORS.text_primary,
                    boxShadow: `0 4px 16px ${TESLA_COLORS.accent}40`,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Navigation size={20} />
                  )}
                  <span>Confirmar Viaje</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default RideDetails;