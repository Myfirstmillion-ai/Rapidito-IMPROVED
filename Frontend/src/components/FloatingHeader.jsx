import { useMemo } from "react";
import { motion } from "framer-motion";
import { Menu, Star } from "lucide-react";

/**
 * FloatingHeader - User Pill
 * Native iOS Apple Maps inspired floating header
 * 
 * Features:
 * - Pill-shaped glassmorphism design
 * - User avatar with rating
 * - Hamburger menu toggle
 * - Green dot online status indicator
 */
function FloatingHeader({ 
  user = {}, 
  onMenuClick, 
  isOnline = true 
}) {
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Get user initials
  const userInitials = useMemo(() => {
    const first = user?.fullname?.firstname?.[0] || '';
    const last = user?.fullname?.lastname?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  }, [user]);

  // Spring animation config
  const springConfig = {
    type: "spring",
    damping: 30,
    stiffness: 300
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
      className="fixed top-4 left-4 z-20"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div 
        className="flex items-center gap-2 rounded-full shadow-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          height: '48px',
          paddingLeft: '4px',
          paddingRight: '4px'
        }}
      >
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* User Avatar with Status */}
        <div className="relative">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user?.fullname?.firstname || 'Usuario'}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {userInitials}
            </div>
          )}
          
          {/* Online Status Indicator */}
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
          )}
        </div>

        {/* User Info & Rating */}
        <div className="pr-3 flex items-center gap-2">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {user?.fullname?.firstname || 'Hola'}
            </p>
          </div>
          
          {/* Rating Badge */}
          {user?.rating && (
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gray-100">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-semibold text-gray-700">
                {typeof user.rating === 'number' 
                  ? user.rating.toFixed(1) 
                  : user.rating?.average?.toFixed(1) || '5.0'}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default FloatingHeader;
