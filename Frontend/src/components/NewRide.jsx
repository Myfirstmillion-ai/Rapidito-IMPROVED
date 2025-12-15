import { useState, useRef } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { 
  MapPinMinus, 
  MapPinPlus, 
  Navigation, 
  ArrowRight,
  ChevronDown,
  X,
  Zap,
  Clock,
  CreditCard,
} from "lucide-react";

/**
 * 🏆 TESLA MATTE PREMIUM - NewRide Component
 * 
 * Design System: $100K Premium UI
 * - Floating Island panel (16px detached)
 * - Matte Black surfaces (NO transparency)
 * - Bento Grid route display
 * - Monochromatic palette + emerald accent
 * - Physics-based drag interactions
 * - Typography-driven hierarchy
 * 
 * Interaction Flow:
 * 1. Panel floats as island from bottom
 * 2. Drag handle for swipe-to-dismiss
 * 3. Route display with pickup/destination
 * 4. Confirm button with physics feedback
 */

// Tesla Matte Color System
const TESLA_COLORS = {
  bg: '#000000',
  surface_1: '#0A0A0A',
  surface_2: '#1C1C1E',
  surface_3: '#2C2C2E',
  text_primary: '#FFFFFF',
  text_secondary: '#8E8E93',
  text_tertiary: '#636366',
  accent: '#10B981',
  divider: '#38383A',
};

// Physics Spring Configuration
const SPRING_CONFIG = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

// Haptic feedback
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

function NewRide({
  pickup,
  destination,
  showPanel,
  setShowPanel,
  fare,
  vehicleType,
  paymentMethod = "cash",
  showNextPanel,
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Physics spring for drag
  const springY = useSpring(0, SPRING_CONFIG);
  const opacity = useTransform(springY, [0, 300], [1, 0]);

  // Check for reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'COP$ 0';
    return `COP$ ${amount.toLocaleString('es-CO')}`;
  };

  // Estimate time based on vehicle type
  const getEstimatedTime = () => {
    if (vehicleType === 'bike') return '8-12 min';
    return '10-15 min';
  };

  // Handle confirm ride
  const handleConfirm = () => {
    if (isConfirming) return;
    
    setIsConfirming(true);
    triggerHaptic('heavy');
    
    setTimeout(() => {
      setShowPanel(false);
      showNextPanel(true);
      setIsConfirming(false);
    }, 600);
  };

  // Handle panel close
  const handleClose = () => {
    setShowPanel(false);
    triggerHaptic('light');
  };

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ 
              opacity,
              background: 'rgba(0, 0, 0, 0.6)' 
            }}
            className="absolute inset-0"
          />

          {/* Floating Island Container */}
          <div 
            className="absolute bottom-0 left-0 right-0"
            style={{ 
              padding: '16px',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            }}
          >
            <motion.div
              initial={prefersReducedMotion ? {} : { y: '100%', scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={prefersReducedMotion ? {} : { y: '100%', scale: 0.95 }}
              transition={SPRING_CONFIG}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              style={{
                y: springY,
                background: TESLA_COLORS.surface_1,
                borderRadius: '32px',
                boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)',
              }}
              className="overflow-hidden"
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="w-12 h-1.5 rounded-full"
                  style={{ background: TESLA_COLORS.divider }}
                />
              </div>

              {/* Content */}
              <div className="px-4 pb-4">
                {/* Header - Typography Hierarchy */}
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-black mb-1" style={{ color: TESLA_COLORS.text_primary }}>
                    Confirma tu viaje
                  </h2>
                  <p className="text-sm" style={{ color: TESLA_COLORS.text_secondary }}>
                    Revisa los detalles antes de continuar
                  </p>
                </div>

                {/* Route Display - Bento Grid */}
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...SPRING_CONFIG, delay: 0.1 }}
                  className="rounded-3xl p-4 mb-4"
                  style={{
                    background: TESLA_COLORS.surface_2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {/* Pickup Location */}
                  <div className="flex items-start gap-3 mb-4">
                    {/* Icon */}
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: `${TESLA_COLORS.accent}20`,
                      }}
                    >
                      <MapPinMinus size={20} style={{ color: TESLA_COLORS.accent }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div 
                        className="text-[10px] font-bold tracking-wider uppercase mb-1"
                        style={{ color: TESLA_COLORS.text_tertiary }}
                      >
                        RECOGIDA
                      </div>
                      <p 
                        className="text-sm font-semibold truncate"
                        style={{ color: TESLA_COLORS.text_primary }}
                      >
                        {pickup || "Ubicación actual"}
                      </p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  <div className="flex items-center justify-center my-2">
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ background: TESLA_COLORS.divider }}
                      />
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ background: TESLA_COLORS.divider }}
                      />
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ background: TESLA_COLORS.divider }}
                      />
                    </div>
                  </div>

                  {/* Destination Location */}
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: TESLA_COLORS.surface_3,
                      }}
                    >
                      <MapPinPlus size={20} style={{ color: TESLA_COLORS.text_secondary }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div 
                        className="text-[10px] font-bold tracking-wider uppercase mb-1"
                        style={{ color: TESLA_COLORS.text_tertiary }}
                      >
                        DESTINO
                      </div>
                      <p 
                        className="text-sm font-semibold truncate"
                        style={{ color: TESLA_COLORS.text_primary }}
                      >
                        {destination || "Seleccionar destino"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Trip Info Grid - Bento Style */}
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...SPRING_CONFIG, delay: 0.2 }}
                  className="grid grid-cols-2 gap-3 mb-4"
                >
                  {/* Estimated Time Card */}
                  <div 
                    className="rounded-2xl p-3"
                    style={{
                      background: TESLA_COLORS.surface_2,
                      border: `1px solid ${TESLA_COLORS.divider}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} style={{ color: TESLA_COLORS.text_tertiary }} />
                      <span 
                        className="text-[10px] font-bold tracking-wider uppercase"
                        style={{ color: TESLA_COLORS.text_tertiary }}
                      >
                        TIEMPO
                      </span>
                    </div>
                    <p className="text-lg font-black" style={{ color: TESLA_COLORS.text_primary }}>
                      {getEstimatedTime()}
                    </p>
                  </div>

                  {/* Vehicle Type Card */}
                  <div 
                    className="rounded-2xl p-3"
                    style={{
                      background: TESLA_COLORS.surface_2,
                      border: `1px solid ${TESLA_COLORS.divider}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={16} style={{ color: TESLA_COLORS.text_tertiary }} />
                      <span 
                        className="text-[10px] font-bold tracking-wider uppercase"
                        style={{ color: TESLA_COLORS.text_tertiary }}
                      >
                        VEHÍCULO
                      </span>
                    </div>
                    <p className="text-lg font-black capitalize" style={{ color: TESLA_COLORS.text_primary }}>
                      {vehicleType === 'bike' ? 'Moto' : 'Carro'}
                    </p>
                  </div>
                </motion.div>

                {/* Fare Display - Prominent */}
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...SPRING_CONFIG, delay: 0.3 }}
                  className="rounded-3xl p-4 mb-6"
                  style={{
                    background: TESLA_COLORS.surface_2,
                    border: `1px solid ${TESLA_COLORS.divider}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: TESLA_COLORS.surface_3 }}
                      >
                        <CreditCard size={20} style={{ color: TESLA_COLORS.text_secondary }} />
                      </div>
                      <div>
                        <div 
                          className="text-[10px] font-bold tracking-wider uppercase mb-0.5"
                          style={{ color: TESLA_COLORS.text_tertiary }}
                        >
                          TARIFA
                        </div>
                        <div className="flex items-center gap-2">
                          {paymentMethod === "nequi" ? (
                            <>
                              <img 
                                src="/payment-icons/nequi-logo.svg" 
                                alt="Nequi" 
                                className="w-4 h-4"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'block';
                                }}
                              />
                              <span className="hidden text-xs font-bold" style={{ color: "#61108C" }}>N</span>
                              <p className="text-sm font-semibold" style={{ color: TESLA_COLORS.text_secondary }}>
                                Nequi
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-semibold" style={{ color: TESLA_COLORS.text_secondary }}>
                              Efectivo
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <h2 className="text-3xl font-black" style={{ color: TESLA_COLORS.text_primary }}>
                        {formatCurrency(fare?.[vehicleType])}
                      </h2>
                    </div>
                  </div>
                </motion.div>

                {/* Confirm Button - Physics Interaction */}
                <motion.button
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING_CONFIG, delay: 0.4 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
                  onTapStart={() => triggerHaptic('heavy')}
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-base transition-opacity disabled:opacity-60"
                  style={{
                    background: TESLA_COLORS.accent,
                    color: TESLA_COLORS.text_primary,
                    boxShadow: `0 8px 24px ${TESLA_COLORS.accent}40, 0 0 0 1px ${TESLA_COLORS.accent}`,
                  }}
                >
                  {isConfirming ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Navigation size={20} />
                      </motion.div>
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <Navigation size={20} />
                      Confirmar Viaje
                      <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NewRide;