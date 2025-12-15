/**
 * Swiss Minimalist Premium Heading Component
 * 
 * Design Philosophy:
 * - Optimized line-height (1.3) for readability
 * - text-wrap: balance to prevent orphan words
 * - Font-bold with proper letter-spacing
 * - Gradient text option for premium feel
 * - Dark mode support
 * - Size variants for hierarchy
 * 
 * @param {string} title - Heading text
 * @param {string} level - Heading level: "h1", "h2", "h3", "h4" (default: "h1")
 * @param {boolean} gradient - Apply emerald gradient (default: false)
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} icon - Optional icon element (left side)
 */
function Heading({ 
  title, 
  level = "h1", 
  gradient = false,
  className = "",
  icon 
}) {
  // Size mapping - Swiss Minimalist Premium hierarchy
  const sizeClasses = {
    h1: "text-3xl sm:text-4xl font-bold leading-tight tracking-tight",
    h2: "text-2xl sm:text-3xl font-bold leading-tight tracking-tight",
    h3: "text-xl sm:text-2xl font-bold leading-snug",
    h4: "text-lg sm:text-xl font-semibold leading-snug",
  };

  // Gradient text utility (Swiss Minimalist emerald)
  const gradientClass = gradient 
    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent" 
    : "text-gray-900 dark:text-white";

  // Common classes - text-balance + optimized line-height
  const commonClasses = `
    ${sizeClasses[level]}
    ${gradientClass}
    mb-6
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Render appropriate heading tag
  const Tag = level;

  return (
    <Tag 
      className={commonClasses}
      style={{ textWrap: 'balance' }} // Prevent orphan words (CSS Text Level 4)
    >
      {icon && (
        <span className="inline-flex items-center gap-2">
          <span className="flex-shrink-0">{icon}</span>
          {title}
        </span>
      )}
      {!icon && title}
    </Tag>
  );
}

export default Heading;