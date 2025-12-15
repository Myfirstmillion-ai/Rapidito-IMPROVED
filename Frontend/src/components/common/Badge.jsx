import { cn } from "../../utils/cn";
import { colors, borderRadius } from "../../styles/designSystem";

/**
 * iOS Deluxe Badge Variants with Premium Styling
 */
const badgeVariants = {
  // Neutral badge - subtle gray
  default: `bg-white/10 text-[${colors.textPrimary}]`,
  
  // Primary badge - iOS accent blue
  primary: `bg-[${colors.accent}] text-white`,
  
  // Status badges with iOS system colors
  success: `bg-[${colors.success}] text-white`,
  warning: `bg-[${colors.warning}] text-white`,
  error: `bg-[${colors.error}] text-white`,
  
  // Ghost badge - transparent with border
  ghost: `bg-transparent border border-[${colors.border}] text-[${colors.textSecondary}]`,
};

/**
 * Badge sizes for different contexts
 */
const badgeSizes = {
  small: "h-6 px-2 text-xs",  // 24px height
  medium: "h-8 px-3 text-sm", // 32px height
};

/**
 * iOS Deluxe Badge/Pill Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant (default, primary, success, warning, error, ghost)
 * @param {string} props.size - Badge size (small, medium)
 * @param {boolean} props.pulsing - Enable subtle pulsing animation for active states
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {string} props.className - Additional CSS classes
 */
function Badge({ 
  children, 
  variant = "default", 
  size = "small",
  pulsing = false,
  icon,
  className 
}) {
  return (
    <span
      className={cn(
        // Base styles - pill shape with centered content
        "inline-flex items-center justify-center font-medium",
        
        // Full rounded corners (pill shape)
        `rounded-[${borderRadius.full}]`,
        
        // Size variants
        badgeSizes[size],
        
        // Color variants
        badgeVariants[variant],
        
        // Optional pulsing animation
        pulsing && "animate-pulse",
        
        // Custom classes
        className
      )}
    >
      {/* Optional icon */}
      {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
      
      {/* Badge content */}
      {children}
    </span>
  );
}

export default Badge;
