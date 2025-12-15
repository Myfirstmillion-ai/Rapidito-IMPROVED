import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Bell, 
  Trash2, 
  CheckCheck, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  MessageCircle,
  Car,
  CreditCard,
  Gift,
  Calendar,
  Clock,
  ChevronDown
} from "lucide-react";
import { colors, shadows, glassEffect, borderRadius } from "../styles/designSystem";
import { NOTIFICATION_TYPES, useNotifications } from "../contexts/NotificationContext";
import Button from "./common/Button";
import Card from "./common/Card";
import Badge from "./common/Badge";

// Variantes de animación para iOS Deluxe
const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { opacity: 0, y: 30, transition: { duration: 0.2 } }
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  }
};

const NotificationCenter = () => {
  const {
    isNotificationCenterOpen,
    closeNotificationCenter,
    groupedNotifications,
    unreadCount,
    markAllAsRead,
    clearAllNotifications,
    handleNotificationClick,
    notificationPreferences,
    updateNotificationPreferences,
    addTestNotification
  } = useNotifications();

  const [expandedSections, setExpandedSections] = useState({
    today: true,
    yesterday: true,
    older: true,
  });

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Si el centro de notificaciones no está abierto, no renderizar nada
  if (!isNotificationCenterOpen) return null;

  // Formatear hora
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  // Seleccionar ícono según el tipo de notificación
  const getIconByType = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.INFO:
        return <Info size={18} className="text-blue-400" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertTriangle size={18} className="text-amber-400" />;
      case NOTIFICATION_TYPES.ERROR:
        return <AlertTriangle size={18} className="text-red-400" />;
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle size={18} className="text-emerald-400" />;
      case NOTIFICATION_TYPES.MESSAGE:
        return <MessageCircle size={18} className="text-indigo-400" />;
      case NOTIFICATION_TYPES.RIDE_REQUEST:
      case NOTIFICATION_TYPES.RIDE_UPDATE:
        return <Car size={18} className="text-sky-400" />;
      case NOTIFICATION_TYPES.PAYMENT:
        return <CreditCard size={18} className="text-violet-400" />;
      case NOTIFICATION_TYPES.PROMO:
        return <Gift size={18} className="text-pink-400" />;
      default:
        return <Bell size={18} className="text-white" />;
    }
  };

  // Obtener color de fondo según el tipo de notificación
  const getBackgroundByType = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.INFO:
        return "bg-blue-500/5";
      case NOTIFICATION_TYPES.WARNING:
        return "bg-amber-500/5";
      case NOTIFICATION_TYPES.ERROR:
        return "bg-red-500/5";
      case NOTIFICATION_TYPES.SUCCESS:
        return "bg-emerald-500/5";
      case NOTIFICATION_TYPES.MESSAGE:
        return "bg-indigo-500/5";
      case NOTIFICATION_TYPES.RIDE_REQUEST:
      case NOTIFICATION_TYPES.RIDE_UPDATE:
        return "bg-sky-500/5";
      case NOTIFICATION_TYPES.PAYMENT:
        return "bg-violet-500/5";
      case NOTIFICATION_TYPES.PROMO:
        return "bg-pink-500/5";
      default:
        return "bg-white/5";
    }
  };

  // Obtener color del borde según el tipo de notificación
  const getBorderByType = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.INFO:
        return "border-blue-500/20";
      case NOTIFICATION_TYPES.WARNING:
        return "border-amber-500/20";
      case NOTIFICATION_TYPES.ERROR:
        return "border-red-500/20";
      case NOTIFICATION_TYPES.SUCCESS:
        return "border-emerald-500/20";
      case NOTIFICATION_TYPES.MESSAGE:
        return "border-indigo-500/20";
      case NOTIFICATION_TYPES.RIDE_REQUEST:
      case NOTIFICATION_TYPES.RIDE_UPDATE:
        return "border-sky-500/20";
      case NOTIFICATION_TYPES.PAYMENT:
        return "border-violet-500/20";
      case NOTIFICATION_TYPES.PROMO:
        return "border-pink-500/20";
      default:
        return "border-white/10";
    }
  };

  // Renderizar una sección de notificaciones
  const renderNotificationSection = (title, notifications, sectionKey) => {
    if (!notifications || notifications.length === 0) return null;

    const isExpanded = expandedSections[sectionKey];

    return (
      <motion.div 
        variants={animationVariants.staggerItem}
        className="mb-6"
      >
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between mb-2"
        >
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">
              {notifications.length} {notifications.length === 1 ? "notificación" : "notificaciones"}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} className="text-white/60" />
            </motion.div>
          </div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="space-y-3"
            >
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  getIconByType={getIconByType}
                  getBackgroundByType={getBackgroundByType}
                  getBorderByType={getBorderByType}
                  formatTime={formatTime}
                  formatDate={formatDate}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      variants={animationVariants.fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={closeNotificationCenter}
    >
      <motion.div
        variants={animationVariants.slideUp}
        className="fixed inset-x-0 bottom-0 top-20 rounded-t-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel principal */}
        <div className="h-full flex flex-col bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#080808] border-t border-white/10">
          {/* Header */}
          <div className="py-4 px-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-white" />
              <h1 className="text-xl font-bold text-white">Notificaciones</h1>
              {unreadCount > 0 && (
                <Badge 
                  variant="primary"
                  text={unreadCount.toString()}
                />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Marcar todas como leídas */}
              <Button
                variant="glass"
                size="icon"
                icon={<CheckCheck size={18} />}
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                disabled={unreadCount === 0}
                aria-label="Marcar todas como leídas"
                className={unreadCount === 0 ? "opacity-50" : ""}
              />
              
              {/* Eliminar todas */}
              <Button
                variant="glass"
                size="icon"
                icon={<Trash2 size={18} />}
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllNotifications();
                }}
                aria-label="Eliminar todas"
                className="text-red-400"
              />
              
              {/* Cerrar */}
              <Button
                variant="glass"
                size="icon"
                icon={<X size={18} />}
                onClick={closeNotificationCenter}
                aria-label="Cerrar"
              />
            </div>
          </div>

          {/* Contenido con scroll */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <motion.div
              variants={animationVariants.staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Notificaciones agrupadas por día */}
              {renderNotificationSection("Hoy", groupedNotifications.today, "today")}
              {renderNotificationSection("Ayer", groupedNotifications.yesterday, "yesterday")}
              {renderNotificationSection("Anteriores", groupedNotifications.older, "older")}
              
              {/* Estado vacío */}
              {groupedNotifications.today.length === 0 &&
               groupedNotifications.yesterday.length === 0 &&
               groupedNotifications.older.length === 0 && (
                <motion.div
                  variants={animationVariants.staggerItem}
                  className="flex flex-col items-center justify-center h-64"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                    <Bell size={24} className="text-white/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Sin notificaciones</h3>
                  <p className="text-sm text-white/60 text-center max-w-xs">
                    No tienes notificaciones por el momento. Cuando las tengas, aparecerán aquí.
                  </p>
                  
                  {/* Botón para crear una notificación de prueba (solo en desarrollo) */}
                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      variant="glass"
                      size="small"
                      title="Crear notificación de prueba"
                      onClick={(e) => {
                        e.stopPropagation();
                        addTestNotification();
                      }}
                      className="mt-4"
                    />
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Componente para un ítem individual de notificación
const NotificationItem = ({ 
  notification, 
  onClick, 
  getIconByType, 
  getBackgroundByType, 
  getBorderByType,
  formatTime,
  formatDate
}) => {
  return (
    <Card
      variant="glass"
      className={`overflow-hidden ${notification.read ? 'opacity-70' : ''} ${getBackgroundByType(notification.type)} ${getBorderByType(notification.type)}`}
      onClick={() => onClick(notification)}
    >
      <div className="p-3 flex gap-3">
        {/* Indicador de no leído */}
        {!notification.read && (
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#10B981]"></div>
        )}
        
        {/* Icono */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
          {getIconByType(notification.type)}
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm mb-1">
            {notification.title}
          </h3>
          <p className="text-xs text-white/70 line-clamp-2 mb-2">
            {notification.message}
          </p>
          <div className="flex items-center text-[10px] text-white/50">
            <Clock size={12} className="mr-1" />
            {formatTime(notification.timestamp)}
            <span className="mx-1">•</span>
            <Calendar size={12} className="mr-1" />
            {formatDate(notification.timestamp)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificationCenter;
