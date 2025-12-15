import { cn } from "../../utils/cn";
import { colors, borderRadius, shadows, glassEffect } from "../../styles/designSystem";

/**
 * iOS Deluxe Floating Island Card Component
 * 
 * Features:
 * - Glassmorphism background with backdrop blur
 * - Floating elevation with premium shadow system
 * - Consistent border radius from design system
 * - Hover animations with subtle lift
 * - Multiple variants for different depth levels
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.padding - Apply default padding (default: true)
 * @param {boolean} props.hoverable - Enable hover effects (default: false)
 * @param {string} props.variant - Card variant: 'default', 'elevated', 'glass', 'floating'
 * @param {string} props.borderRadius - Border radius size: 'small', 'medium', 'large', 'xlarge'
 * @param {boolean} props.animate - Enable entrance animation
 */
function Card({ 
  children, 
  className, 
  padding = true, 
  hoverable = false,
  variant = "default",
  borderRadius = "medium",
  animate = false
}) {
  // Map border radius values from design system
  const radiusValues = {
    small: borderRadius.small, // 8px
    medium: borderRadius.medium, // 16px
    large: borderRadius.large, // 24px
    xlarge: borderRadius.xlarge, // 32px
  };
  
  // Define variant styles based on iOS Deluxe design system
  const variantClasses = {
    // Standard card with minimal elevation
    default: `bg-[${colors.card}] shadow-[${shadows.level1}] border border-[${colors.border}]`,
    
    // Elevated card with more prominent shadow
    elevated: `bg-[${colors.card}] shadow-[${shadows.level2}] border border-[${colors.border}]`,
    
    // Glassmorphism card with backdrop blur
    glass: `bg-[${glassEffect.background}] backdrop-filter backdrop-blur-[20px] backdrop-saturate-[180%] border border-[${colors.border}] shadow-[${shadows.level2}]`,
    
    // Floating island with maximum elevation
    floating: `bg-[${glassEffect.background}] backdrop-filter backdrop-blur-[20px] backdrop-saturate-[180%] border border-[${colors.border}] shadow-[${shadows.level4}]`,
    
    // Interactive card with hover effects built-in
    interactive: `bg-[${colors.card}] shadow-[${shadows.level1}] border border-[${colors.border}] hover:shadow-[${shadows.level3}] cursor-pointer`,
  };

  return (
    <div
      className={cn(
        // Base styles with no background (specified in variants)
        `rounded-[${radiusValues[borderRadius]}] overflow-hidden`,
        
        // Premium transitions with spring physics
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        
        // Consistent padding from design system (20px)
        padding && "p-5", // 20px padding
        
        // Apply hover effects if enabled
        hoverable && `hover:translate-y-[-2px] hover:shadow-[${shadows.level3}]`,
        
        // Animation classes for entrance effects
        animate && "animate-fadeInUp",
        
        // Apply variant-specific classes
        variantClasses[variant],
        
        // User-provided classes
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;

