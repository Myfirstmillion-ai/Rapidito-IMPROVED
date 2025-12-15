import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Swiss Minimalist Premium Alert Component
 * 
 * Design Philosophy:
 * - Glassmorphism with backdrop-blur-xl
 * - Premium emerald gradient for success
 * - Smooth spring animations (framer-motion)
 * - Icon-driven visual hierarchy
 * - Dark mode support
 * 
 * @param {string} heading - Alert title
 * @param {string} text - Alert message
 * @param {boolean} isVisible - Controls visibility
 * @param {Function} onClose - Close callback
 * @param {string} type - "success" or "failure"
 */
export const Alert = ({ heading, text, isVisible, onClose, type }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Icon mapping with premium lucide-react icons
  const iconMap = {
    success: CheckCircle2,
    failure: XCircle,
  };

  // Color schemes - Swiss Minimalist Premium
  const colorSchemes = {
    success: {
      icon: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/20 dark:bg-emerald-400/20",
      border: "border-emerald-500/30 dark:border-emerald-400/30",
      button: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30",
    },
    failure: {
      icon: "text-red-500 dark:text-red-400",
      iconBg: "bg-red-500/20 dark:bg-red-400/20",
      border: "border-red-500/30 dark:border-red-400/30",
      button: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30",
    },
  };

  const Icon = iconMap[type] || AlertCircle;
  const colors = colorSchemes[type] || colorSchemes.failure;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? {} : { opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { scale: 0.95, opacity: 0, y: 10 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 350,
              mass: 0.8,
            }}
            className={`
              w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-2
              ${colors.border}
            `}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
          >
            {/* Subtle top accent line */}
            <div 
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-60"
              style={{ color: type === 'success' ? '#10b981' : '#ef4444' }}
            />

            {/* Header with Icon */}
            <div className="pt-8 pb-4 px-6 flex flex-col items-center">
              {/* Icon Badge */}
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 300,
                  delay: 0.1,
                }}
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center mb-5
                  ${colors.iconBg}
                  ring-4 ring-white/50 dark:ring-black/20
                `}
              >
                <Icon className={`w-10 h-10 ${colors.icon}`} strokeWidth={2.5} />
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2"
              >
                {heading}
              </motion.h1>

              {/* Message */}
              <motion.p
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-base text-gray-600 dark:text-gray-300 text-center leading-relaxed px-2"
                style={{ textWrap: 'balance' }}
              >
                {text}
              </motion.p>
            </div>

            {/* Close Button - Premium Gradient */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="px-6 pb-6"
            >
              <button
                onClick={onClose}
                className={`
                  w-full py-4 rounded-2xl font-bold text-base
                  transition-all duration-200
                  active:scale-95
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  ${colors.button}
                  ${type === 'success' 
                    ? 'focus-visible:ring-emerald-500' 
                    : 'focus-visible:ring-red-500'}
                `}
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};