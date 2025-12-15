import { motion } from "framer-motion";
import { Star, Clock, Award, TrendingUp } from "lucide-react";

/**
 * 🏆 TESLA MATTE PREMIUM - DriverStatsPill Component
 * 
 * Design System: $100K Premium UI
 * - Compact matte pill floating in corner
 * - Monochromatic palette (black/gray/white)
 * - Emerald accent only for rating
 * - Physics-based expand/collapse
 * - Typography-driven hierarchy
 * - NO glassmorphism or transparency
 * 
 * Usage: Floating stats overlay for active ride view
 */

// Tesla Matte Color System
const TESLA_COLORS = {
  bg: '#000000',
  surface_1: '#0A0A0A',
  surface_2: '#1C1C1E',
  surface_3: '#2C2C2E',
  text_primary: '#FFFFFF',
  text_secondary: '#8E8E93',
  text_tertiary: '#636366',
  accent: '#10B981',
  divider: '#38383A',
};

// Physics Spring Configuration
const SPRING_CONFIG = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

// Haptic feedback
const triggerHaptic = (intensity = 'light') => {
  if (navigator.vibrate) {
    const patterns = {
      light: [5],
      medium: [10],
      heavy: [15],
    };
    navigator.vibrate(patterns[intensity]);
  }
};

function DriverStatsPill({ stats, position = "top-right", onExpand }) {
  const {
    rating = 4.8,
    totalRides = 1247,
    completionRate = 98,
    activeTime = "4.5h",
  } = stats || {};

  // Check for reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Position classes
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={SPRING_CONFIG}
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      onTapStart={() => triggerHaptic('light')}
      onClick={onExpand}
      className={`fixed ${positionClasses[position]} z-40 cursor-pointer`}
      style={{
        // Matte surface (NO transparency)
        background: TESLA_COLORS.surface_1,
        borderRadius: '24px',
        padding: '12px 16px',
        border: `1px solid ${TESLA_COLORS.divider}`,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04)',
        // Safe area adjustment
        paddingTop: position.includes('top') ? 'max(12px, env(safe-area-inset-top))' : '12px',
        paddingBottom: position.includes('bottom') ? 'max(12px, env(safe-area-inset-bottom))' : '12px',
      }}
    >
      {/* Compact Layout - Horizontal Stats */}
      <div className="flex items-center gap-3">
        
        {/* Rating - Primary Stat (Emerald Accent) */}
        <motion.div 
          className="flex items-center gap-1.5"
          whileHover={{ scale: 1.1 }}
          transition={SPRING_CONFIG}
        >
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ 
              background: `${TESLA_COLORS.accent}20`,
            }}
          >
            <Star 
              size={16} 
              fill={TESLA_COLORS.accent}
              style={{ color: TESLA_COLORS.accent }} 
            />
          </div>
          <span 
            className="text-lg font-black"
            style={{ color: TESLA_COLORS.text_primary }}
          >
            {rating}
          </span>
        </motion.div>

        {/* Divider */}
        <div 
          className="w-px h-6"
          style={{ background: TESLA_COLORS.divider }}
        />

        {/* Total Rides - Secondary Stat */}
        <div className="flex items-center gap-1.5">
          <Award 
            size={14} 
            style={{ color: TESLA_COLORS.text_tertiary }} 
          />
          <span 
            className="text-sm font-bold"
            style={{ color: TESLA_COLORS.text_secondary }}
          >
            {totalRides.toLocaleString()}
          </span>
        </div>

        {/* Divider */}
        <div 
          className="w-px h-6"
          style={{ background: TESLA_COLORS.divider }}
        />

        {/* Completion Rate - Tertiary Stat */}
        <div className="flex items-center gap-1.5">
          <TrendingUp 
            size={14} 
            style={{ color: TESLA_COLORS.text_tertiary }} 
          />
          <span 
            className="text-sm font-bold"
            style={{ color: TESLA_COLORS.text_secondary }}
          >
            {completionRate}%
          </span>
        </div>
      </div>

      {/* Subtle pulse indicator (driver is active) */}
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
        style={{ 
          background: TESLA_COLORS.accent,
          boxShadow: `0 0 8px ${TESLA_COLORS.accent}80`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

/**
 * DriverStatsPillExpanded - Full stats view
 * Opens when user taps the compact pill
 */
export function DriverStatsPillExpanded({ stats, onCollapse }) {
  const {
    rating = 4.8,
    totalRides = 1247,
    completionRate = 98,
    activeTime = "4.5h",
    todayRides = 12,
    earnings = 145000,
  } = stats || {};

  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
    >
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCollapse}
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      />

      {/* Expanded Card - Floating Island */}
      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0.8, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        exit={prefersReducedMotion ? {} : { scale: 0.8, y: -50 }}
        transition={SPRING_CONFIG}
        className="relative w-full max-w-sm rounded-3xl p-6"
        style={{
          background: TESLA_COLORS.surface_1,
          border: `1px solid ${TESLA_COLORS.divider}`,
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h3 className="text-xl font-black mb-1" style={{ color: TESLA_COLORS.text_primary }}>
            Estadísticas del Conductor
          </h3>
          <p className="text-sm" style={{ color: TESLA_COLORS.text_secondary }}>
            Rendimiento en tiempo real
          </p>
        </div>

        {/* Stats Grid - Bento Layout */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          
          {/* Rating Card */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_CONFIG, delay: 0.1 }}
            className="col-span-2 rounded-2xl p-4"
            style={{
              background: `linear-gradient(135deg, ${TESLA_COLORS.accent}15, ${TESLA_COLORS.accent}08)`,
              border: `1px solid ${TESLA_COLORS.accent}40`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `${TESLA_COLORS.accent}30` }}
                >
                  <Star size={28} fill={TESLA_COLORS.accent} style={{ color: TESLA_COLORS.accent }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider uppercase mb-0.5" style={{ color: TESLA_COLORS.text_tertiary }}>
                    CALIFICACIÓN
                  </p>
                  <h2 className="text-4xl font-black" style={{ color: TESLA_COLORS.accent }}>
                    {rating}
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: TESLA_COLORS.text_secondary }}>
                  {totalRides.toLocaleString()} viajes
                </p>
              </div>
            </div>
          </motion.div>

          {/* Today's Rides */}
          <StatCard
            icon={Clock}
            label="HOY"
            value={todayRides}
            unit="viajes"
            delay={0.2}
          />

          {/* Active Time */}
          <StatCard
            icon={TrendingUp}
            label="ACTIVO"
            value={activeTime}
            delay={0.25}
          />

          {/* Completion Rate */}
          <StatCard
            icon={Award}
            label="COMPLETADOS"
            value={`${completionRate}%`}
            delay={0.3}
          />

          {/* Earnings */}
          <StatCard
            icon={Award}
            label="GANANCIA HOY"
            value={`$${(earnings / 1000).toFixed(0)}K`}
            delay={0.35}
          />
        </div>

        {/* Close hint */}
        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs"
          style={{ color: TESLA_COLORS.text_tertiary }}
        >
          Toca fuera para cerrar
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

/**
 * StatCard - Individual stat display in Bento Grid
 */
function StatCard({ icon: Icon, label, value, unit, delay = 0 }) {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_CONFIG, delay }}
      className="rounded-2xl p-3"
      style={{
        background: TESLA_COLORS.surface_2,
        border: `1px solid ${TESLA_COLORS.divider}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color: TESLA_COLORS.text_tertiary }} />
        <p 
          className="text-[9px] font-bold tracking-wider uppercase"
          style={{ color: TESLA_COLORS.text_tertiary }}
        >
          {label}
        </p>
      </div>
      <h3 className="text-2xl font-black mb-0.5" style={{ color: TESLA_COLORS.text_primary }}>
        {value}
      </h3>
      {unit && (
        <p className="text-xs" style={{ color: TESLA_COLORS.text_secondary }}>
          {unit}
        </p>
      )}
    </motion.div>
  );
}

export default DriverStatsPill;