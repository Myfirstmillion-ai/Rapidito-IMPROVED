import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Locate } from "lucide-react";

/**
 * MapControls - Floating Circles
 * Native iOS Apple Maps inspired map control buttons
 * 
 * Features:
 * - Circular glassmorphism buttons
 * - Zoom In/Out and Recenter
 * - Hover scale effect (1.1)
 * - Active press effect (0.95)
 */
function MapControls({ 
  onZoomIn, 
  onZoomOut, 
  onRecenter,
  isLocating = false 
}) {
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

  // Button variants for hover/tap animations
  const buttonVariants = {
    hover: prefersReducedMotion ? {} : { scale: 1.1 },
    tap: prefersReducedMotion ? {} : { scale: 0.95 }
  };

  // Stagger animation for children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.3
      }
    }
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? {} : { opacity: 0, x: 20 },
    show: prefersReducedMotion ? {} : { opacity: 1, x: 0 }
  };

  // Button style object for glassmorphism
  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="fixed right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3"
      style={{ paddingRight: 'env(safe-area-inset-right, 0px)' }}
    >
      {/* Zoom In Button */}
      <motion.button
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onZoomIn}
        className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
        style={buttonStyle}
        aria-label="Acercar mapa"
      >
        <Plus className="w-5 h-5 text-gray-700" />
      </motion.button>

      {/* Zoom Out Button */}
      <motion.button
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onZoomOut}
        className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
        style={buttonStyle}
        aria-label="Alejar mapa"
      >
        <Minus className="w-5 h-5 text-gray-700" />
      </motion.button>

      {/* Recenter Button - Emerald Background */}
      <motion.button
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onRecenter}
        disabled={isLocating}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
          isLocating 
            ? 'opacity-70 cursor-wait' 
            : 'hover:shadow-xl'
        }`}
        style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
        }}
        aria-label="Centrar en mi ubicación"
      >
        <Locate 
          className={`w-5 h-5 text-white ${isLocating ? 'animate-pulse' : ''}`} 
        />
      </motion.button>
    </motion.div>
  );
}

export default MapControls;
