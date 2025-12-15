import { useRef, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Star, Navigation, ChevronRight } from "lucide-react";

/**
 * LocationSearchPanel - Bottom Sheet with Route Inputs
 * Native iOS Apple Maps inspired location search interface
 * 
 * Features:
 * - Bottom sheet with spring physics
 * - Drag handle
 * - Route inputs with visual connector
 * - Staggered suggestion list animations
 */
function LocationSearchPanel({
  isOpen,
  onClose,
  pickupValue,
  destinationValue,
  onPickupChange,
  onDestinationChange,
  onLocationSelect,
  onGetCurrentLocation,
  suggestions = [],
  selectedInput = "destination",
  onInputFocus,
  isGettingLocation = false,
  isSearching = false // New prop to show loading state during debounce
}) {
  const destinationInputRef = useRef(null);
  const [activeInput, setActiveInput] = useState(selectedInput);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Auto-focus destination input when panel opens
  useEffect(() => {
    if (isOpen && destinationInputRef.current) {
      setTimeout(() => {
        destinationInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Spring animation config
  const springConfig = {
    type: "spring",
    damping: 30,
    stiffness: 300
  };

  // Stagger animation for suggestions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        delayChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? {} : { opacity: 0, x: -20 },
    show: prefersReducedMotion ? {} : { opacity: 1, x: 0 }
  };

  const handleInputFocus = (inputType) => {
    setActiveInput(inputType);
    onInputFocus?.(inputType);
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
            className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Planifica tu ruta
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar panel"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Route Inputs Container */}
            <div className="px-5 pb-4">
              <div className="relative">
                {/* Visual Connector Line */}
                <div className="absolute left-[21px] top-[20px] bottom-[20px] w-0.5 bg-gradient-to-b from-emerald-500 to-cyan-500" />

                {/* Pickup Input */}
                <div className="relative flex items-center gap-3 mb-3">
                  {/* Green Circle Indicator */}
                  <div className="relative z-10 w-[10px] h-[10px] rounded-full border-2 border-emerald-500 bg-white dark:bg-gray-900 flex-shrink-0" />
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={pickupValue}
                      onChange={(e) => onPickupChange(e.target.value)}
                      onFocus={() => handleInputFocus('pickup')}
                      placeholder="Punto de recogida"
                      className={`w-full h-14 px-4 pr-12 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all ${
                        activeInput === 'pickup' 
                          ? 'ring-2 ring-emerald-500 bg-white dark:bg-gray-700' 
                          : ''
                      }`}
                    />
                    <button
                      onClick={onGetCurrentLocation}
                      disabled={isGettingLocation}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors disabled:opacity-50"
                      aria-label="Usar ubicación actual"
                    >
                      <Navigation 
                        className={`w-4 h-4 text-white ${isGettingLocation ? 'animate-pulse' : ''}`} 
                      />
                    </button>
                  </div>
                </div>

                {/* Destination Input */}
                <div className="relative flex items-center gap-3">
                  {/* Map Pin Indicator */}
                  <div className="relative z-10 flex-shrink-0">
                    <MapPin className="w-[10px] h-[14px] text-cyan-500" fill="currentColor" />
                  </div>
                  
                  <div className="flex-1">
                    <input
                      ref={destinationInputRef}
                      type="text"
                      value={destinationValue}
                      onChange={(e) => onDestinationChange(e.target.value)}
                      onFocus={() => handleInputFocus('destination')}
                      placeholder="¿A dónde vas?"
                      className={`w-full h-14 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all ${
                        activeInput === 'destination' 
                          ? 'ring-2 ring-cyan-500 bg-white dark:bg-gray-700' 
                          : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ maxHeight: '50vh' }}>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                {/* Loading State - Shows during debounce */}
                {isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Buscando ubicaciones...</span>
                    </div>
                  </div>
                )}
                
                {!isSearching && suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.01, x: 4 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                      onClick={() => onLocationSelect(suggestion, activeInput)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      {/* Icon Badge */}
                      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-500" />
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {typeof suggestion === 'string' 
                            ? suggestion.split(',')[0] 
                            : suggestion.title || suggestion}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {typeof suggestion === 'string' 
                            ? suggestion.split(',').slice(1).join(',').trim() 
                            : suggestion.subtitle || ''}
                        </p>
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </motion.div>
                  ))
                ) : !isSearching && (
                  /* Empty State - Recent & Favorites */
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Sugerencias
                    </p>
                    
                    {/* Placeholder items */}
                    <div
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Búsquedas recientes
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-500" />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Lugares favoritos
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default LocationSearchPanel;
