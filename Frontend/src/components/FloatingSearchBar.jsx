import { useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Home, Clock } from "lucide-react";

/**
 * FloatingSearchBar - The Island
 * Native iOS Apple Maps inspired floating search interface
 * 
 * Features:
 * - Glassmorphism design
 * - Heavy drop shadow (shadow-2xl)
 * - Quick actions (Home, Recent)
 * - Click to expand into LocationSearchPanel
 */
function FloatingSearchBar({ 
  onClick, 
  isCollapsed = true,
  onHomeClick,
  onRecentClick,
  recentLocations = []
}) {
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Spring animation config
  const springConfig = {
    type: "spring",
    damping: 30,
    stiffness: 300
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springConfig, delay: 0.2 }}
      className="fixed bottom-6 left-4 right-4 z-20 flex justify-center"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        onClick={onClick}
        className="w-full max-w-lg cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label="Buscar destino"
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        {/* Main Search Container - Glassmorphism with Dark Mode */}
        <div 
          className="rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] active:scale-[0.99] bg-white/95 dark:bg-gray-900/95 border border-white/30 dark:border-gray-700/50"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}
        >
          {/* Search Input Area */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              {/* Search Icon */}
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              
              {/* Placeholder Text */}
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ¿A dónde vas?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Encuentra tu próximo destino
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-gray-200 dark:bg-gray-700" />

          {/* Quick Actions */}
          <div className="px-5 py-3 flex items-center gap-6">
            {/* Home Quick Action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHomeClick?.();
              }}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
              aria-label="Ir a casa"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 flex items-center justify-center transition-colors">
                <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium">Casa</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* Recent Quick Action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRecentClick?.();
              }}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
              aria-label="Ver recientes"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 flex items-center justify-center transition-colors">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium">Recientes</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default FloatingSearchBar;
