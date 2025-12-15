import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "../../utils/cn";
import { colors, borderRadius, shadows, glassEffect } from "../../styles/designSystem";

/**
 * iOS Deluxe Modal Component with Premium Styling
 * 
 * Features:
 * - Glassmorphism backdrop with strong blur effect
 * - Spring physics animations for natural movement
 * - Centered modal with premium shadow system
 * - Minimal close button (X) in corner
 * - Escape key to close for accessibility
 * - Click outside to dismiss
 * - Different size options
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal should close
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.title - Optional modal title
 * @param {boolean} props.showCloseButton - Show close button (default: true)
 * @param {string} props.size - Modal size: 'sm', 'md', 'lg', 'xl', 'full' (default: 'md')
 * @param {boolean} props.closeOnOverlayClick - Close when clicking overlay (default: true)
 * @param {boolean} props.closeOnEscape - Close on ESC key (default: true)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.glass - Use glassmorphism effect (default: true)
 */
function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  showCloseButton = true,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  glass = true,
}) {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // iOS Deluxe modal sizes with premium proportions
  const sizeClasses = {
    sm: "max-w-md w-[90%]",      // 448px
    md: "max-w-lg w-[90%]",      // 512px
    lg: "max-w-2xl w-[90%]",     // 672px
    xl: "max-w-4xl w-[90%]",     // 896px
    full: "max-w-[1100px] w-[95%]", // Near full screen but with margins
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Premium Backdrop with Strong Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 bg-black/60 z-50 backdrop-blur-lg`}
            onClick={closeOnOverlayClick ? onClose : undefined}
            aria-hidden="true"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ 
                type: "spring",
                damping: 30,
                stiffness: 350,
                mass: 0.8
              }}
              className={cn(
                // Base styling
                "w-full pointer-events-auto",
                "max-h-[90vh] overflow-y-auto",
                
                // iOS-style rounded corners
                `rounded-[${borderRadius.large}] overflow-hidden`,
                
                // Glassmorphism effect when enabled
                glass ? `${glassEffect.background} backdrop-filter ${glassEffect.backdropFilter} border ${glassEffect.border}` : 
                       `bg-[${colors.card}] border border-[${colors.border}]`,
                
                // Premium shadow for depth
                `shadow-[${shadows.level3}]`,
                
                // Size variations
                sizeClasses[size],
                
                // Additional custom classes
                className
              )}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
            >
              {/* Header with iOS Deluxe styling */}
              {(title || showCloseButton) && (
                <div className={`flex items-center justify-between px-6 py-5 ${title ? `border-b border-[${colors.border}]` : ''}`}>
                  {title && (
                    <h2 
                      id="modal-title"
                      className={`text-[22px] font-semibold text-[${colors.textPrimary}]`}
                    >
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className={`p-2 hover:bg-white/10 rounded-full transition-colors ${!title ? 'absolute right-4 top-4 z-10' : 'ml-auto'}`}
                      aria-label="Close modal"
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Modal;
