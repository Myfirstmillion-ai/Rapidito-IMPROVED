import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Users, Zap, ChevronRight } from "lucide-react";
import PaymentMethodSelector from "./PaymentMethodSelector";

/**
 * 🏆 TESLA MATTE PREMIUM - SelectVehicle Component
 * 
 * Design System: $100K Premium UI
 * - Dynamic Island vehicle cards (iOS-inspired)
 * - Matte Black surfaces (NO transparency)
 * - Bento Grid vehicle comparison
 * - Monochromatic palette + emerald accent
 * - Physics-based card selection
 * - Typography-driven hierarchy
 * 
 * Interaction Flow:
 * 1. Cards float as islands (16px from edges)
 * 2. Selected card expands with spring physics
 * 3. Haptic feedback on tap
 * 4. Smooth transition to next screen
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

// Vehicle data with matte styling
const vehicles = [
  {
    id: 1,
    name: "Carro",
    description: "Cómodo y seguro",
    type: "car",
    image: "/Uber-PNG-Photos.png",
    capacity: "4 personas",
    eta: "3-5 min",
    icon: "🚗",
  },
  {
    id: 2,
    name: "Moto",
    description: "Rápido y económico",
    type: "bike",
    image: "/bike.webp",
    capacity: "1 persona",
    eta: "2-4 min",
    icon: "🏍️",
  },
];

function SelectVehicle({
  selectedVehicle,
  showPanel,
  setShowPanel,
  showPreviousPanel,
  showNextPanel,
  fare,
  paymentMethod = "cash",
  onPaymentMethodChange = () => {},
}) {
  const [currentlySelected, setCurrentlySelected] = useState(null);
  const [hoveredVehicle, setHoveredVehicle] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethod);

  // Check for reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Reset selection when panel closes
  useEffect(() => {
    if (!showPanel) {
      setCurrentlySelected(null);
    }
  }, [showPanel]);

  // Format currency
  const formatPrice = (price) => {
    if (!price) return '$0';
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const formatFullPrice = (price) => {
    if (!price) return 'COP$ 0';
    return `COP$ ${price.toLocaleString('es-CO')}`;
  };

  const handleSelect = (vehicle) => {
    setCurrentlySelected(vehicle.id);
    triggerHaptic('medium');
    
    setTimeout(() => {
      selectedVehicle(vehicle.type);
      onPaymentMethodChange(selectedPaymentMethod);
      setShowPanel(false);
      showNextPanel(true);
      triggerHaptic('heavy');
    }, 300);
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
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
            onClick={() => setShowPanel(false)}
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
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
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > 150 || velocity.y > 500) {
                  setShowPanel(false);
                  triggerHaptic('light');
                }
              }}
              className="overflow-hidden"
              style={{
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

              {/* Content */}
              <div className="px-4 pb-4">
                {/* Header - Typography Hierarchy */}
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-black mb-1" style={{ color: TESLA_COLORS.text_primary }}>
                    Elige tu viaje
                  </h2>
                  <p className="text-sm" style={{ color: TESLA_COLORS.text_secondary }}>
                    Selecciona el vehículo que prefieras
                  </p>
                </div>

                {/* Vehicle Cards - Dynamic Islands */}
                <div className="space-y-3 mb-6">
                  {vehicles.map((vehicle, index) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      fare={fare}
                      isSelected={currentlySelected === vehicle.id}
                      isHovered={hoveredVehicle === vehicle.id}
                      onSelect={() => handleSelect(vehicle)}
                      onHoverStart={() => setHoveredVehicle(vehicle.id)}
                      onHoverEnd={() => setHoveredVehicle(null)}
                      formatPrice={formatPrice}
                      formatFullPrice={formatFullPrice}
                      prefersReducedMotion={prefersReducedMotion}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
                
                {/* Payment Method Selector - iOS Deluxe Style */}
                <div className="mb-4">
                  <PaymentMethodSelector 
                    selectedMethod={selectedPaymentMethod}
                    onMethodChange={handlePaymentMethodChange}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * VehicleCard - Dynamic Island Component
 * Matte card with physics-based selection animation
 */
function VehicleCard({
  vehicle,
  fare,
  isSelected,
  isHovered,
  onSelect,
  onHoverStart,
  onHoverEnd,
  formatPrice,
  formatFullPrice,
  prefersReducedMotion,
  delay,
}) {
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING_CONFIG, delay }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onTapStart={() => triggerHaptic('medium')}
      onClick={onSelect}
      className="relative cursor-pointer rounded-3xl overflow-hidden"
      style={{
        background: isSelected 
          ? `linear-gradient(135deg, ${TESLA_COLORS.accent}15, ${TESLA_COLORS.accent}08)` 
          : TESLA_COLORS.surface_2,
        border: isSelected 
          ? `2px solid ${TESLA_COLORS.accent}` 
          : `1px solid ${TESLA_COLORS.divider}`,
        boxShadow: isSelected 
          ? `0 8px 24px ${TESLA_COLORS.accent}40, 0 0 0 1px ${TESLA_COLORS.accent}` 
          : '0 4px 12px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Selection Indicator - Floating Check */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={prefersReducedMotion ? {} : { scale: 0, rotate: 180 }}
            transition={SPRING_CONFIG}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: TESLA_COLORS.accent,
              boxShadow: `0 4px 12px ${TESLA_COLORS.accent}60`,
            }}
          >
            <Check size={20} strokeWidth={3} style={{ color: TESLA_COLORS.text_primary }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Grid */}
      <div className="p-4 flex items-center gap-4">
        {/* Vehicle Image/Icon - Left */}
        <div className="flex-shrink-0 relative">
          <motion.div
            animate={isSelected || isHovered ? { scale: 1.1, rotate: -5 } : { scale: 1, rotate: 0 }}
            transition={SPRING_CONFIG}
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: TESLA_COLORS.surface_3 }}
          >
            {/* Vehicle emoji icon */}
            <span className="text-4xl">{vehicle.icon}</span>
          </motion.div>
        </div>

        {/* Vehicle Info - Center */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 
            className="text-lg font-bold mb-0.5" 
            style={{ 
              color: isSelected ? TESLA_COLORS.accent : TESLA_COLORS.text_primary 
            }}
          >
            {vehicle.name}
          </h3>

          {/* Description */}
          <p className="text-sm mb-2" style={{ color: TESLA_COLORS.text_secondary }}>
            {vehicle.description}
          </p>

          {/* Bento Grid - Capacity + ETA */}
          <div className="flex items-center gap-2">
            {/* Capacity */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: TESLA_COLORS.surface_3 }}>
              <Users size={12} style={{ color: TESLA_COLORS.text_tertiary }} />
              <span className="text-xs font-medium" style={{ color: TESLA_COLORS.text_secondary }}>
                {vehicle.capacity}
              </span>
            </div>

            {/* ETA */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: TESLA_COLORS.surface_3 }}>
              <Clock size={12} style={{ color: TESLA_COLORS.text_tertiary }} />
              <span className="text-xs font-medium" style={{ color: TESLA_COLORS.text_secondary }}>
                {vehicle.eta}
              </span>
            </div>
          </div>
        </div>

        {/* Price - Right (Prominent Typography) */}
        <div className="flex-shrink-0 text-right">
          {/* Large Price */}
          <motion.div
            animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <h2 
              className="text-3xl font-black leading-none mb-1" 
              style={{ 
                color: isSelected ? TESLA_COLORS.accent : TESLA_COLORS.text_primary 
              }}
            >
              {formatPrice(fare?.[vehicle.type])}
            </h2>
          </motion.div>

          {/* Small Full Price */}
          <p className="text-xs" style={{ color: TESLA_COLORS.text_tertiary }}>
            {formatFullPrice(fare?.[vehicle.type])}
          </p>
        </div>
      </div>

      {/* Accent Glow Line at Bottom (when selected) */}
      {isSelected && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={SPRING_CONFIG}
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${TESLA_COLORS.accent}, ${TESLA_COLORS.accent}80, ${TESLA_COLORS.accent})`,
          }}
        />
      )}

      {/* Hover Indicator - Subtle Arrow */}
      <AnimatePresence>
        {isHovered && !isSelected && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <ChevronRight size={24} style={{ color: TESLA_COLORS.text_tertiary }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default SelectVehicle;