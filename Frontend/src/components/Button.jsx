import { Link } from "react-router-dom";
import Spinner from "./Spinner";

/**
 * Swiss Minimalist Luxury Button Component
 * 
 * Design Philosophy:
 * - NO BORDERS: Clean, borderless design
 * - PILL SHAPE: Fully rounded capsule design (rounded-full)
 * - VARIANTS: primary (Emerald Gradient), secondary (White/Black shadow), danger (Red Soft)
 * - TACTILE FEEDBACK: active:scale-95 transition-transform duration-200
 * - Minimum 56px touch target (Apple HIG standard)
 * 
 * @param {string} path - Link destination (for type="link")
 * @param {string} title - Button text
 * @param {React.ReactNode} icon - Optional icon element
 * @param {string} type - "link", "submit", or button (default)
 * @param {string} variant - "primary" (default), "secondary", "danger"
 * @param {string} classes - Additional Tailwind classes
 * @param {function} fun - onClick handler
 * @param {boolean} loading - Loading state
 * @param {string} loadingMessage - Text to show when loading
 * @param {boolean} disabled - Disabled state
 */

// Swiss Minimalist Tactile Feedback - MUST include active:scale-95
const TACTILE_FEEDBACK = "transition-transform duration-200 active:scale-95 hover:scale-[1.02]";

// Pill Shape - No borders
const PILL_SHAPE = "rounded-full border-0";

// Variant Styles
const VARIANTS = {
  // Primary: Emerald Gradient - Premium CTA
  primary: [
    "bg-gradient-to-r from-emerald-500 to-emerald-600",
    "hover:from-emerald-600 hover:to-emerald-700",
    "text-white font-semibold",
    "shadow-lg hover:shadow-xl hover:shadow-emerald-500/25",
  ].join(" "),
  
  // Secondary: White/Black with shadow - Subtle actions
  secondary: [
    "bg-white dark:bg-black",
    "text-gray-900 dark:text-white",
    "shadow-lg hover:shadow-xl",
    "ring-1 ring-gray-200/50 dark:ring-white/10",
  ].join(" "),
  
  // Danger: Red Soft - Destructive actions
  danger: [
    "bg-red-50 dark:bg-red-900/30",
    "text-red-600 dark:text-red-400",
    "hover:bg-red-100 dark:hover:bg-red-900/50",
    "shadow-sm hover:shadow-md",
  ].join(" "),
};

function Button({ 
  path, 
  title, 
  icon, 
  type, 
  variant = "primary", 
  classes, 
  fun, 
  loading, 
  loadingMessage, 
  disabled 
}) {
  // Get variant styles or fallback to primary
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;

  // Common classes - PILL SHAPE with generous padding
  const commonClasses = `
    flex justify-center items-center gap-3
    py-4 px-8 font-semibold text-base w-full
    ${PILL_SHAPE}
    min-h-[56px]
    ${TACTILE_FEEDBACK}
    ${variantClasses}
    ${classes || ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <>
      {type === "link" ? (
        <Link
          to={path}
          className={commonClasses}
          aria-label={title}
        >
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </Link>
      ) : (
        <button
          type={type || "button"}
          className={`
            ${commonClasses}
            cursor-pointer
            disabled:opacity-50 
            disabled:cursor-not-allowed 
            disabled:active:scale-100
            disabled:hover:scale-100
            focus:outline-none 
            focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-offset-2
            ${loading ? "cursor-wait opacity-90" : ""}
          `.trim().replace(/\s+/g, ' ')}
          onClick={fun}
          disabled={loading || disabled}
          aria-busy={loading}
          aria-label={title}
        >
          {loading ? (
            <span className="flex gap-3 items-center">
              <Spinner size="sm" />
              <span className="font-semibold">{loadingMessage || "Cargando..."}</span>
            </span>
          ) : (
            <>
              {icon && <span aria-hidden="true">{icon}</span>}
              <span className="tracking-wide">{title}</span>
            </>
          )}
        </button>
      )}
    </>
  );
}

export default Button;
