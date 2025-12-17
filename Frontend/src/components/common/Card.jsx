import { cn } from "../../utils/cn";

/**
 * Premium Card Component - Uber-style Design
 *
 * Features:
 * - Clean, modern design
 * - Multiple variants (default, elevated, glass, floating)
 * - Hover animations
 * - Consistent border radius
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
  // Border radius values
  const radiusValues = {
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
  };

  // Variant styles with inline styles (fixes Tailwind dynamic class issue)
  const variantStyles = {
    default: {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #E5E7EB',
    },
    elevated: {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #E5E7EB',
    },
    glass: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.3)',
    },
    floating: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid rgba(255,255,255,0.4)',
    },
    dark: {
      backgroundColor: '#1A1A1A',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    darkGlass: {
      backgroundColor: 'rgba(26,26,26,0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentRadius = radiusValues[borderRadius] || radiusValues.medium;

  const cardStyle = {
    ...currentVariant,
    borderRadius: currentRadius,
    padding: padding ? '20px' : '0',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
  };

  return (
    <div
      className={cn(
        hoverable && "hover:-translate-y-1 cursor-pointer",
        animate && "animate-fadeInUp",
        className
      )}
      style={cardStyle}
    >
      {children}
    </div>
  );
}

export default Card;

