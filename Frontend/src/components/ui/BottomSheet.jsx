import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { colors, borderRadius, shadows, glassEffect } from "../../styles/designSystem";

/**
 * iOS Deluxe BottomSheet Component
 * 
 * Features:
 * - Slide from bottom with spring physics
 * - Glassmorphism background with blur effect
 * - Swipe to dismiss with natural gesture physics
 * - Handle bar pill indicator for dragging
 * - Minimal close button (X) in corner
 * - Backdrop blur when sheet is open
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls visibility
 * @param {Function} props.onClose - Callback when sheet should close
 * @param {React.ReactNode} props.children - Sheet content
 * @param {string} props.title - Optional title
 * @param {string|number} props.height - Sheet height (auto, full, or pixel value)
 * @param {boolean} props.showCloseButton - Show close button (default: true)
 * @param {boolean} props.glass - Use glassmorphism effect (default: true)
 * @param {string} props.className - Additional CSS classes
 */
function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  title,
  height = "auto",
  showCloseButton = true,
  glass = true,
  className
}) {
  // Helper to determine height styling
  const getHeightStyle = () => {
    if (height === 'auto') return {};
    if (height === 'full') return { height: '90vh' };
    return { height };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Premium Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            onClick={onClose}
          />
          
          {/* iOS Deluxe Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring",
              damping: 35,
              stiffness: 350,
              mass: 0.8
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 120 || velocity.y > 500) {
                onClose();
              }
            }}
            className={cn(
              // Base positioning
              "fixed bottom-0 left-0 right-0 z-50",
              
              // Maximum height and scrolling
              "max-h-[90vh] overflow-y-auto pb-safe",
              
              // iOS-style top rounded corners (larger radius)
              `rounded-t-[${borderRadius.xlarge}]`,
              
              // Glassmorphism effect when enabled
              glass ? `${glassEffect.background} backdrop-filter ${glassEffect.backdropFilter} border-t ${glassEffect.border}` : 
                     `bg-[${colors.card}] border-t border-[${colors.border}]`,
              
              // Premium shadow for top edge
              `shadow-[${shadows.level4}]`,
              
              // Additional custom classes
              className
            )}
            style={getHeightStyle()}
          >
            {/* iOS Handle Bar Indicator */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header with iOS Deluxe styling */}
            {(title || showCloseButton) && (
              <div className={`flex items-center justify-between px-6 py-4 ${title ? `border-b border-[${colors.border}]` : ''}`}>
                {title && (
                  <h2 className={`text-[22px] font-semibold text-[${colors.textPrimary}]`}>
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={`p-2 hover:bg-white/10 rounded-full transition-colors ${!title ? 'absolute right-4 top-4 z-10' : 'ml-auto'}`}
                  >
                    <X size={20} className={`text-[${colors.textPrimary}]`} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}

            {/* Content area with consistent padding */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BottomSheet;
