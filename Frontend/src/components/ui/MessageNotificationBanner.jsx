import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { colors, shadows, glassEffect, borderRadius } from "../../styles/designSystem";

/**
 * iOS Deluxe Message Notification Banner
 * Premium notification that slides down from top with spring physics
 * Features iOS-style glassmorphism and floating design
 * 
 * @param {Object} props
 * @param {string} props.senderName - Name of message sender
 * @param {string} props.message - Message preview text
 * @param {boolean} props.show - Controls visibility
 * @param {Function} props.onClose - Callback when banner closes
 * @param {Function} props.onTap - Callback when banner is tapped
 */
function MessageNotificationBanner({ 
  senderName = "Usuario",
  message = "",
  show = false,
  onClose = () => {},
  onTap = () => {}
}) {
  // Auto-dismiss timer duration
  const autoDismissTime = 4500; // 4.5 seconds for iOS style
  
  // Spring animation configuration
  const springTransition = {
    type: "spring",
    damping: 25,
    stiffness: 300,
    mass: 0.85
  };

  useEffect(() => {
    if (show) {
      // Auto-dismiss after time period
      const timer = setTimeout(() => {
        onClose();
      }, autoDismissTime);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-x-0 top-0 z-[400] pointer-events-none p-4">
          {/* Container with max-width for larger screens */}
          <div className="mx-auto max-w-md">
            {/* iOS Deluxe Notification Banner */}
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={springTransition}
              onClick={onTap}
              className={cn(
                "w-full pointer-events-auto cursor-pointer",
                "rounded-2xl overflow-hidden"
              )}
              style={{
                boxShadow: shadows.large
              }}
            >
              {/* Glassmorphism background */}
              <div 
                className="relative backdrop-blur-xl p-4 flex items-center gap-3"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                {/* Message Icon with pulsing animation */}
                <div 
                  className="flex-shrink-0 relative"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-[${colors.accent}] to-[${colors.accent}]/70 flex items-center justify-center shadow-lg`}>
                    <MessageCircle size={22} className="text-white" />
                  </div>
                  <motion.div 
                    className={`absolute inset-0 rounded-full border-2 border-[${colors.accent}]/30`}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2.5,
                      ease: "easeInOut" 
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base mb-0.5 drop-shadow-sm">
                    Mensaje de {senderName}
                  </h3>
                  <p className="text-sm text-white/80 truncate drop-shadow-sm">
                    {message || "Toca para abrir el chat"}
                  </p>
                </div>

                {/* Close Button - iOS style */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all hover:bg-white/20 active:scale-95"
                  aria-label="Cerrar"
                >
                  <X size={16} className="text-white" strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MessageNotificationBanner;
