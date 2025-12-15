import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import { cn } from "../../utils/cn";
import { colors, borderRadius, shadows, animation } from "../../styles/designSystem";

// iOS Deluxe button variants - Premium with glassmorphism and depth layers
const buttonVariants = {
  // Primary filled button - iOS accent blue
  primary: `
    bg-[${colors.accent}]
    text-white
    shadow-[${shadows.level1}]
    hover:shadow-[${shadows.level2}]
    hover:brightness-110
    hover:-translate-y-[2px]
  `,

  // Secondary outline button - subtle border with transparent background
  secondary: `
    bg-transparent
    border border-[${colors.border}]
    text-[${colors.textPrimary}]
    hover:bg-white/5
    hover:border-white/20
    hover:shadow-[${shadows.level1}]
  `,

  // Ghost button - completely transparent with hover effect
  ghost: `
    bg-transparent
    text-[${colors.textPrimary}]
    hover:bg-white/5
  `,

  // Glass button - glassmorphism effect
  glass: `
    bg-[${colors.glassBg}]
    backdrop-filter backdrop-blur-xl backdrop-saturate-180
    border border-[${colors.border}]
    text-[${colors.textPrimary}]
    shadow-[${shadows.level2}]
    hover:shadow-[${shadows.level3}]
    hover:-translate-y-[2px]
  `,

  // Success button - iOS green
  success: `
    bg-[${colors.success}]
    text-white
    shadow-[${shadows.level1}]
    hover:shadow-[${shadows.level2}]
    hover:brightness-110
    hover:-translate-y-[2px]
  `,

  // Warning button - iOS orange
  warning: `
    bg-[${colors.warning}]
    text-white
    shadow-[${shadows.level1}]
    hover:shadow-[${shadows.level2}]
    hover:brightness-110
    hover:-translate-y-[2px]
  `,

  // Error button - iOS red
  error: `
    bg-[${colors.error}]
    text-white
    shadow-[${shadows.level1}]
    hover:shadow-[${shadows.level2}]
    hover:brightness-110
    hover:-translate-y-[2px]
  `,
};

// iOS Deluxe button sizes
const buttonSizes = {
  small: `h-[36px] px-4 text-[15px] font-medium`, // Small: 36px
  medium: `h-[44px] px-6 text-[17px] font-semibold`, // Medium: 44px (iOS standard)
  large: `h-[52px] px-8 text-[17px] font-semibold`, // Large: 52px
};

/**
 * iOS Deluxe Button Component
 * 
 * Features:
 * - iOS standard sizes (36px, 44px, 52px heights)
 * - Active state with scale(0.97)
 * - Spring physics animations
 * - Glassmorphism effect option
 * - Multiple variants and sizes
 * - Loading state with spinner
 * - Support for icons
 * - Ripple effect on click
 * 
 * @param {Object} props
 * @param {string} props.path - Link path (when type="link")
 * @param {string} props.title - Button text
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {string} props.type - button type or "link"
 * @param {string} props.classes - Additional CSS classes
 * @param {Function} props.fun - onClick handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.loadingMessage - Loading text
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.variant - Button variant (primary, secondary, ghost, glass, success, warning, error)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.fullWidth - Full width button (default: true for mobile)
 * @param {boolean} props.iconOnly - Icon-only button with equal width/height
 */

const rippleEffect = {
  position: 'absolute',
  borderRadius: '50%',
  transform: 'scale(0)',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  animation: 'ripple 600ms linear',
  '@keyframes ripple': {
    to: {
      transform: 'scale(4)',
      opacity: 0,
    },
  },
};

const useRipple = (event) => {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  
  for (const key in rippleEffect) {
    if (key !== '@keyframes ripple') {
      ripple.style[key] = rippleEffect[key];
    }
  }
  
  ripple.style.width = `${diameter}px`;
  ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
  ripple.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
  
  button.appendChild(ripple);
  
  const keyframes = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  
  const styleElement = document.createElement('style');
  styleElement.innerHTML = keyframes;
  document.head.appendChild(styleElement);
  
  setTimeout(() => {
    ripple.remove();
    styleElement.remove();
  }, 600);
};
function Button({ 
  path, 
  title, 
  icon, 
  type, 
  classes, 
  fun, 
  loading, 
  loadingMessage, 
  disabled,
  variant = "primary",
  size = "medium",
  fullWidth = true,
  iconOnly = false
}) {
  const handleRipple = (event) => {
    if (!disabled && !loading) {
      useRipple(event);
    }
  };

  const baseClasses = cn(
    // Base layout and typography
    "flex justify-center items-center gap-2 relative overflow-hidden",
    // Border radius based on design system
    `rounded-[${borderRadius.small}]`,
    // Premium smooth transitions with spring physics
    `transition-all duration-[${animation.duration.normal}] ${animation.easeDefault}`,
    // Disabled state
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
    // Tactile press feedback
    "active:scale-[0.97] active:brightness-95",
    // Accessible focus state
    `focus:outline-none focus-visible:ring-2 focus-visible:ring-[${colors.accent}]/30 focus-visible:ring-offset-1`,
    // Conditional classes
    fullWidth && "w-full",
    iconOnly && "aspect-square p-0 justify-center",
    buttonSizes[size],
    buttonVariants[variant],
    loading && "cursor-not-allowed opacity-80 pointer-events-none",
    classes
  );

  if (type === "link") {
    return (
      <Link to={path} className={baseClasses} onClick={handleRipple}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {!iconOnly && title}
      </Link>
    );
  }

  return (
    <button
      type={type || "button"}
      className={baseClasses}
      onClick={(e) => {
        handleRipple(e);
        if (fun) fun(e);
      }}
      disabled={loading || disabled}
    >
      {loading ? (
        <span className="flex gap-2 items-center">
          <Spinner color={variant === "secondary" || variant === "ghost" ? colors.textPrimary : "white"} />
          {!iconOnly && (loadingMessage || "Cargando...")}
        </span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {!iconOnly && title}
        </>
      )}
    </button>
  );
}

export default Button;

