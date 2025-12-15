import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Map, 
  User, 
  Settings,
  MessageSquare,
  Bell,
  History,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";

/**
 * 🏆 TESLA MATTE PREMIUM - CommandDock Component
 * 
 * Design System: $100K Premium UI
 * - Floating dock detached from bottom (16px)
 * - Matte Black pill shape (NO transparency)
 * - Monochromatic icons + emerald accent
 * - Physics-based hover/tap interactions
 * - Expandable quick actions
 * - Haptic feedback on interactions
 * 
 * Usage: Primary navigation dock for app
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

// Main navigation items
const mainNavItems = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'map', icon: Map, label: 'Mapa' },
  { id: 'messages', icon: MessageSquare, label: 'Mensajes', badge: 3 },
  { id: 'profile', icon: User, label: 'Perfil' },
];

// Quick action items (expandable menu)
const quickActions = [
  { id: 'history', icon: History, label: 'Historial' },
  { id: 'notifications', icon: Bell, label: 'Notificaciones' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
];

function CommandDock({ 
  activeTab = 'home', 
  onTabChange,
  onQuickAction,
  hideLabels = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();
  
  // Obtener datos de notificaciones del contexto
  const { unreadCount, toggleNotificationCenter } = useNotifications();

  // Check for reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const handleTabChange = (tabId) => {
    triggerHaptic('medium');
    onTabChange?.(tabId);
  };

  const handleQuickAction = (actionId) => {
    triggerHaptic('heavy');
    
    // Manejo especial para acciones específicas
    if (actionId === 'notifications') {
      toggleNotificationCenter();
    } else if (actionId === 'settings') {
      navigate('/settings');
    } else if (actionId === 'history') {
      const isUser = localStorage.getItem("userType") === "user";
      navigate(isUser ? "/user/rides" : "/captain/rides");
    } else {
      // Para otras acciones personalizadas
      onQuickAction?.(actionId);
    }
    
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    triggerHaptic(isExpanded ? 'light' : 'heavy');
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Expanded Quick Actions Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleExpanded}
              className="absolute inset-0"
              style={{ background: 'rgba(0, 0, 0, 0.6)' }}
            />

            {/* Quick Actions Menu - Floating above dock */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-center px-4">
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0.8, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={prefersReducedMotion ? {} : { scale: 0.8, y: 20, opacity: 0 }}
                transition={SPRING_CONFIG}
                className="rounded-3xl p-4"
                style={{
                  background: TESLA_COLORS.surface_1,
                  border: `1px solid ${TESLA_COLORS.divider}`,
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)',
                  maxWidth: '320px',
                }}
              >
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {quickActions.map((action, index) => (
                    <QuickActionButton
                      key={action.id}
                      action={action}
                      onClick={() => handleQuickAction(action.id)}
                      delay={index * 0.05}
                      prefersReducedMotion={prefersReducedMotion}
                      unreadCount={unreadCount}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Command Dock - Floating Island */}
      <motion.div
        initial={prefersReducedMotion ? {} : { y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={SPRING_CONFIG}
        className="fixed bottom-4 left-4 right-4 z-50 flex justify-center"
        style={{
          paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
        }}
      >
        <div
          className="rounded-[32px] px-6 py-4 flex items-center gap-2"
          style={{
            background: TESLA_COLORS.surface_1,
            border: `1px solid ${TESLA_COLORS.divider}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Main Navigation Items */}
          {mainNavItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              isHovered={hoveredItem === item.id}
              onClick={() => handleTabChange(item.id)}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              hideLabel={hideLabels}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}

          {/* Divider */}
          <div 
            className="w-px h-10 mx-1"
            style={{ background: TESLA_COLORS.divider }}
          />

          {/* Expand Button (Plus/X) */}
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
            onTapStart={() => triggerHaptic('medium')}
            onClick={toggleExpanded}
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: isExpanded ? TESLA_COLORS.accent : TESLA_COLORS.surface_2,
              boxShadow: isExpanded 
                ? `0 4px 16px ${TESLA_COLORS.accent}40, 0 0 0 1px ${TESLA_COLORS.accent}`
                : 'none',
            }}
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="close"
                  initial={prefersReducedMotion ? {} : { rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={prefersReducedMotion ? {} : { rotate: 90, scale: 0 }}
                  transition={SPRING_CONFIG}
                >
                  <X size={20} style={{ color: TESLA_COLORS.text_primary }} />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={prefersReducedMotion ? {} : { rotate: 90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={prefersReducedMotion ? {} : { rotate: -90, scale: 0 }}
                  transition={SPRING_CONFIG}
                >
                  <Plus size={20} style={{ color: TESLA_COLORS.text_secondary }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulse indicator when not expanded */}
            {!isExpanded && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{ 
                  background: TESLA_COLORS.accent,
                  boxShadow: `0 0 8px ${TESLA_COLORS.accent}80`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

/**
 * NavButton - Individual navigation button
 */
function NavButton({ 
  item, 
  isActive, 
  isHovered,
  onClick, 
  onHoverStart,
  onHoverEnd,
  hideLabel,
  prefersReducedMotion,
}) {
  const Icon = item.icon;

  return (
    <motion.button
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onTapStart={() => triggerHaptic('light')}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-1 min-w-[56px] py-2 px-3 rounded-2xl transition-colors"
      style={{
        background: isActive 
          ? `linear-gradient(135deg, ${TESLA_COLORS.accent}15, ${TESLA_COLORS.accent}08)` 
          : isHovered 
          ? TESLA_COLORS.surface_2 
          : 'transparent',
      }}
    >
      {/* Icon Container */}
      <div className="relative">
        <Icon 
          size={22} 
          strokeWidth={isActive ? 2.5 : 2}
          style={{ 
            color: isActive ? TESLA_COLORS.accent : TESLA_COLORS.text_secondary 
          }} 
        />
        
        {/* Badge for notifications/messages */}
        {item.badge && (
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
            style={{
              background: TESLA_COLORS.accent,
              boxShadow: `0 2px 8px ${TESLA_COLORS.accent}60`,
            }}
          >
            <span className="text-[10px] font-black" style={{ color: TESLA_COLORS.text_primary }}>
              {item.badge > 9 ? '9+' : item.badge}
            </span>
          </motion.div>
        )}
      </div>

      {/* Label (optional) */}
      {!hideLabel && (
        <motion.span
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold tracking-wide"
          style={{ 
            color: isActive ? TESLA_COLORS.accent : TESLA_COLORS.text_tertiary 
          }}
        >
          {item.label}
        </motion.span>
      )}

      {/* Active indicator line */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
          style={{ background: TESLA_COLORS.accent }}
          transition={SPRING_CONFIG}
        />
      )}
    </motion.button>
  );
}

/**
 * QuickActionButton - Button in expanded menu
 */
function QuickActionButton({ action, onClick, delay, prefersReducedMotion, unreadCount }) {
  const Icon = action.icon;
  
  // Determinar si debe mostrar un badge y cuántos elementos
  const showBadge = action.id === 'notifications' && unreadCount > 0;
  const badgeCount = unreadCount;

  return (
    <motion.button
      initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
      transition={{ ...SPRING_CONFIG, delay }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      onTapStart={() => triggerHaptic('medium')}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-2 py-4 rounded-2xl"
      style={{
        background: TESLA_COLORS.surface_2,
        border: `1px solid ${TESLA_COLORS.divider}`,
      }}
    >
      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: TESLA_COLORS.surface_3 }}
      >
        <Icon size={20} style={{ color: TESLA_COLORS.text_secondary }} />
      </div>

      {/* Label */}
      <span 
        className="text-[10px] font-bold tracking-wide px-2 text-center"
        style={{ color: TESLA_COLORS.text_secondary }}
      >
        {action.label}
      </span>

      {/* Badge */}
      {showBadge && (
        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1.5"
          style={{
            background: TESLA_COLORS.accent,
            boxShadow: `0 2px 8px ${TESLA_COLORS.accent}60`,
          }}
        >
          <span className="text-[10px] font-black" style={{ color: TESLA_COLORS.text_primary }}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        </motion.div>
      )}
    </motion.button>
  );
}

export default CommandDock;
