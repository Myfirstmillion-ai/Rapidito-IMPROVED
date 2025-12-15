import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Users, Check, ChevronLeft } from "lucide-react";

/**
 * VehiclePanel - Horizontal Vehicle Carousel
 * Native iOS Apple Maps inspired vehicle selection
 * 
 * Features:
 * - Bottom sheet with spring physics
 * - Horizontal scrolling carousel
 * - Spotlight effect on selected vehicle
 * - Massive price typography (text-4xl)
 */

// Vehicle data with emojis
const vehicles = [
  {
    id: 1,
    name: "Rapidito",
    description: "Económico",
    type: "car",
    emoji: "🚗",
    image: "/Uber-PNG-Photos.png",
    capacity: "4 personas",
    eta: "3 min",
    color: "from-emerald-500 to-emerald-600"
  },
  {
    id: 2,
    name: "Moto",
    description: "Súper rápido",
    type: "bike",
    emoji: "🏍️",
    image: "/bike.webp",
    capacity: "1 persona",
    eta: "2 min",
    color: "from-blue-500 to-blue-600"
  }
];

function VehiclePanel({
  isOpen,
  onClose,
  onBack,
  onConfirm,
  fare = { car: 0, bike: 0 },
  routeInfo = { distance: '', duration: '' },
  selectedVehicleType,
  onSelectVehicle,
  loading = false
}) {
  const [selected, setSelected] = useState(selectedVehicleType || 'car');
  const scrollRef = useRef(null);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Update selection when prop changes
  useEffect(() => {
    if (selectedVehicleType) {
      setSelected(selectedVehicleType);
    }
  }, [selectedVehicleType]);

  // Spring animation config
  const springConfig = {
    type: "spring",
    damping: 30,
    stiffness: 300
  };

  const handleSelect = (vehicleType) => {
    setSelected(vehicleType);
    onSelectVehicle?.(vehicleType);
  };

  const handleConfirm = () => {
    onConfirm?.(selected);
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return '$0';
    const thousands = Math.floor(price / 1000);
    return `$${thousands}K`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={prefersReducedMotion ? {} : { y: '100%' }}
            animate={{ y: 0 }}
            exit={prefersReducedMotion ? {} : { y: '100%' }}
            transition={springConfig}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <div className="flex items-center gap-3">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Volver"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Elige tu viaje
                  </h2>
                  {routeInfo.distance && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {routeInfo.distance} • {routeInfo.duration}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar panel"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Vehicle Carousel */}
            <div 
              ref={scrollRef}
              className="flex gap-4 px-6 pb-6 overflow-x-auto scrollbar-hide"
              style={{ 
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={selected === vehicle.type}
                  onClick={() => handleSelect(vehicle.type)}
                  price={fare[vehicle.type] || 0}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </div>

            {/* Confirm Button */}
            <div className="px-5 pb-6">
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                onClick={handleConfirm}
                disabled={loading}
                className="w-full h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-2xl shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:shadow-xl"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirmar Viaje</span>
                    <span className="text-emerald-200">→</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * VehicleCard - Individual vehicle option with spotlight effect
 */
function VehicleCard({ vehicle, isSelected, onClick, price, prefersReducedMotion }) {
  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { y: -4 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      onClick={onClick}
      className={`
        relative flex-shrink-0 w-40 rounded-3xl p-4 cursor-pointer transition-all duration-300
        ${isSelected 
          ? `bg-gradient-to-br ${vehicle.color} ring-4 ring-emerald-400 shadow-2xl` 
          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
      style={{ 
        scrollSnapAlign: 'start',
        ...(isSelected && {
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)'
        })
      }}
    >
      {/* Selected Checkmark */}
      {isSelected && (
        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg"
        >
          <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
        </motion.div>
      )}

      {/* Glow Effect when Selected */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-3xl blur-xl opacity-50 -z-10"
          style={{
            background: `radial-gradient(circle at center, rgba(16, 185, 129, 0.6) 0%, transparent 70%)`
          }}
        />
      )}

      {/* Emoji Icon */}
      <div className="text-5xl mb-3 text-center">
        {vehicle.emoji}
      </div>

      {/* Vehicle Name */}
      <h3 className={`text-base font-bold mb-0.5 ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
        {vehicle.name}
      </h3>
      
      {/* Description */}
      <p className={`text-xs mb-3 ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
        {vehicle.description}
      </p>

      {/* Meta Info */}
      <div className="space-y-1.5 mb-3">
        <div className={`flex items-center gap-1.5 text-xs ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
          <Users className="w-3 h-3" />
          <span>{vehicle.capacity}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
          <Clock className="w-3 h-3" />
          <span>{vehicle.eta}</span>
        </div>
      </div>

      {/* Price - MASSIVE */}
      <div className={`text-4xl font-black ${isSelected ? 'text-white' : 'text-emerald-500'}`}>
        {price > 0 ? `$${Math.floor(price / 1000)}K` : '$—'}
      </div>
      
      {/* Full price in COP */}
      {price > 0 && (
        <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
          COP$ {price.toLocaleString('es-CO')}
        </p>
      )}
    </motion.div>
  );
}

export default VehiclePanel;
