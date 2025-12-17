import { cn } from "../../utils/cn";

/**
 * Premium Badge Component - Uber-style Design
 */
function Badge({
  children,
  variant = "default",
  size = "small",
  pulsing = false,
  icon,
  className
}) {
  // Variant styles with inline styles
  const variantStyles = {
    default: {
      backgroundColor: '#F3F4F6',
      color: '#374151',
    },
    primary: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
    },
    success: {
      backgroundColor: '#22C55E',
      color: '#FFFFFF',
    },
    warning: {
      backgroundColor: '#F59E0B',
      color: '#FFFFFF',
    },
    error: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#6B7280',
      border: '1px solid #E5E7EB',
    },
    dark: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: '#FFFFFF',
    },
  };

  const sizeStyles = {
    small: { height: '24px', padding: '0 8px', fontSize: '12px' },
    medium: { height: '32px', padding: '0 12px', fontSize: '14px' },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentSize = sizeStyles[size] || sizeStyles.small;

  const badgeStyle = {
    ...currentVariant,
    ...currentSize,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    borderRadius: '9999px',
    transition: 'all 0.2s ease',
  };

  return (
    <span
      className={cn(pulsing && "animate-pulse", className)}
      style={badgeStyle}
    >
      {icon && <span style={{ marginRight: '4px', marginLeft: '-2px' }}>{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
