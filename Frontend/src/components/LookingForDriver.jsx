import { useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";

/**
 * LookingForDriver - Minimal Overlay with Pulsing Pin
 * Native iOS Apple Maps inspired design
 * 
 * Features:
 * - Sonar wave effect (3 concentric pulsing rings)
 * - Floating glassmorphism status card
 * - Spring physics animations
 */
function LookingForDriver({ isVisible = false, onCancel }) {
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Spring animation config for smooth motion
  const springConfig = {
    type: "spring",
    damping: 30,
    stiffness: 300
  };

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Pulsing Location Pin - Centered on map */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        {/* Sonar Wave Effect - 3 Concentric Rings */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Outer ring - slowest */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-emerald-500/60"
            style={{
              animation: prefersReducedMotion 
                ? 'none' 
                : 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              animationDelay: '0s'
            }}
          />
          
          {/* Middle ring */}
          <div 
            className="absolute inset-4 rounded-full border-2 border-emerald-500/70"
            style={{
              animation: prefersReducedMotion 
                ? 'none' 
                : 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              animationDelay: '0.5s'
            }}
          />
          
          {/* Inner ring - fastest */}
          <div 
            className="absolute inset-8 rounded-full border-2 border-emerald-500/80"
            style={{
              animation: prefersReducedMotion 
                ? 'none' 
                : 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              animationDelay: '1s'
            }}
          />
          
          {/* Center Pin Icon */}
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={springConfig}
            className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
          >
            <MapPin className="w-6 h-6 text-white" fill="white" />
          </motion.div>
        </div>
      </div>

      {/* Floating Status Card - Bottom Center */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
        transition={springConfig}
        className="absolute bottom-6 left-6 right-6 pointer-events-auto"
      >
        <div 
          className="mx-auto max-w-md rounded-3xl shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}
        >
          <div className="px-6 py-5">
            <div className="flex items-center gap-4">
              {/* Spinning Loader Icon */}
              <motion.div
                animate={prefersReducedMotion ? {} : { rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg"
              >
                <Loader2 className="w-6 h-6 text-white" />
              </motion.div>
              
              {/* Status Text */}
              <div className="flex-1">
                <motion.h2
                  animate={prefersReducedMotion ? {} : { opacity: [1, 0.7, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-lg font-bold text-gray-900"
                >
                  Conectando...
                </motion.h2>
                <p className="text-sm text-gray-500">
                  Buscando conductor cercano
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ width: '50%' }}
              />
            </div>

            {/* Cancel Button */}
            {onCancel && (
              <button
                onClick={onCancel}
                className="mt-4 w-full py-3 rounded-2xl text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancelar búsqueda
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* CSS for pulse-ring animation */}
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default LookingForDriver;
