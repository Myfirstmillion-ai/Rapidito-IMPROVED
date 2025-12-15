/**
 * Premium Spinner Component - "Pulsing Radar" Effect
 * A sleek, branded loading indicator with emerald gradient
 */
function Spinner({ scale = 1, size = "md", variant = "default" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const sizeClass = sizes[size] || sizes.md;

  // Pulsing Radar variant - Premium branded effect
  if (variant === "radar") {
    return (
      <div className={`relative ${sizeClass}`} style={{ transform: `scale(${scale})` }}>
        {/* Outer pulsing rings */}
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
        <div className="absolute inset-1 rounded-full bg-emerald-400/30 animate-ping" style={{ animationDelay: "0.2s" }} />
        {/* Core dot */}
        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/50" />
      </div>
    );
  }

  // Default: Premium gradient spinning ring
  return (
    <div
      className={`${sizeClass} relative`}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Gradient ring with smooth rotation */}
      <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-white/10"
        />
        {/* Spinner arc */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="url(#spinnerGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="45 100"
          className="drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
        />
      </svg>
      {/* Center glow dot */}
      <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60 animate-pulse" />
    </div>
  );
}

export default Spinner;
