import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import { cn } from "../../utils/cn";

/**
 * Premium Button Component - Uber-style Design
 *
 * Features:
 * - Clean, modern design with solid colors
 * - Smooth transitions and hover effects
 * - Multiple variants and sizes
 * - Loading state with spinner
 * - Support for icons
 * - Touch-friendly feedback
 */
function Button({
  path,
  title,
  icon,
  type,
  classes,
  fun,
  onClick, // Support both onClick and fun
  loading,
  loadingMessage,
  disabled,
  variant = "primary",
  size = "medium",
  fullWidth = true,
  iconOnly = false
}) {
  // Combine onClick and fun handlers - onClick takes precedence
  const handleClick = onClick || fun;

  // Size configurations
  const sizeStyles = {
    small: { height: '40px', padding: '0 16px', fontSize: '14px' },
    medium: { height: '48px', padding: '0 24px', fontSize: '16px' },
    large: { height: '56px', padding: '0 32px', fontSize: '16px' },
  };

  // Variant configurations with inline styles (fixes Tailwind dynamic class issue)
  const variantStyles = {
    primary: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      border: 'none',
    },
    secondary: {
      backgroundColor: '#F3F4F6',
      color: '#111827',
      border: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      border: '1px solid rgba(255,255,255,0.2)',
    },
    glass: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: '#FFFFFF',
      border: '1px solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(20px)',
    },
    success: {
      backgroundColor: '#22C55E',
      color: '#FFFFFF',
      border: 'none',
    },
    warning: {
      backgroundColor: '#F59E0B',
      color: '#FFFFFF',
      border: 'none',
    },
    error: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#000000',
      border: '2px solid #000000',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;
  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const baseStyle = {
    ...currentVariant,
    height: currentSize.height,
    padding: iconOnly ? '0' : currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: '600',
    borderRadius: '12px',
    width: fullWidth ? '100%' : 'auto',
    aspectRatio: iconOnly ? '1' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'all 0.2s ease',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
  };

  const baseClasses = cn(
    "hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
    classes
  );

  if (type === "link") {
    return (
      <Link
        to={path}
        className={baseClasses}
        style={baseStyle}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {!iconOnly && title}
      </Link>
    );
  }

  return (
    <button
      type={type || "button"}
      className={baseClasses}
      style={baseStyle}
      onClick={(e) => {
        if (!disabled && !loading && handleClick) {
          handleClick(e);
        }
      }}
      disabled={loading || disabled}
    >
      {loading ? (
        <span className="flex gap-2 items-center">
          <Spinner color={variant === "secondary" ? "#111827" : "white"} />
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

