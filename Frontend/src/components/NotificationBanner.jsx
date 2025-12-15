import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, AlertTriangle, CheckCircle, MessageCircle, Car, Bell, CreditCard, Gift } from "lucide-react";
import { colors, shadows, glassEffect, borderRadius } from "../styles/designSystem";
import { NOTIFICATION_TYPES } from "../contexts/NotificationContext";

const NotificationBanner = ({ 
  notification, 
  onClose, 
  onTap 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setIsAnimating(true);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleTap = () => {
    handleClose();
    onTap?.();
  };

  // Si no hay notificación o no es visible, no renderizar nada
  if (!notification || !isVisible) return null;

  // Seleccionar ícono según el tipo de notificación
  const getIconByType = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.INFO:
        return <Info size={24} className="text-blue-400" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertTriangle size={24} className="text-amber-400" />;
      case NOTIFICATION_TYPES.ERROR:
        return <AlertTriangle size={24} className="text-red-400" />;
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle size={24} className="text-emerald-400" />;
      case NOTIFICATION_TYPES.MESSAGE:
        return <MessageCircle size={24} className="text-indigo-400" />;
      case NOTIFICATION_TYPES.RIDE_REQUEST:
      case NOTIFICATION_TYPES.RIDE_UPDATE:
        return <Car size={24} className="text-sky-400" />;
      case NOTIFICATION_TYPES.PAYMENT:
        return <CreditCard size={24} className="text-violet-400" />;
      case NOTIFICATION_TYPES.PROMO:
        return <Gift size={24} className="text-pink-400" />;
      default:
        return <Bell size={24} className="text-white" />;
    }
  };

  // Obtener color de fondo según el tipo de notificación
  const getBackgroundByType = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.INFO:
        return "bg-blue-500/10";
      case NOTIFICATION_TYPES.WARNING:
        return "bg-amber-500/10";
      case NOTIFICATION_TYPES.ERROR:
        return "bg-red-500/10";
      case NOTIFICATION_TYPES.SUCCESS:
        return "bg-emerald-500/10";
      case NOTIFICATION_TYPES.MESSAGE:
        return "bg-indigo-500/10";
      case NOTIFICATION_TYPES.RIDE_REQUEST:
      case NOTIFICATION_TYPES.RIDE_UPDATE:
        return "bg-sky-500/10";
      case NOTIFICATION_TYPES.PAYMENT:
        return "bg-violet-500/10";
      case NOTIFICATION_TYPES.PROMO:
        return "bg-pink-500/10";
      default:
        return "bg-gray-500/10";
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
        return "border-white/20";
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[400] pointer-events-none px-4 pt-4 pb-2">
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={handleTap}
            className={`
              backdrop-blur-xl rounded-xl shadow-2xl border pointer-events-auto cursor-pointer
              ${getBackgroundByType(notification.type)}
              ${getBorderByType(notification.type)}
            `}
            style={{
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            }}
          >
            <div className="p-4 flex items-start gap-3">
              {/* Icono */}
              <div className="flex-shrink-0 rounded-full p-1 bg-white/10 backdrop-blur-md">
                {getIconByType(notification.type)}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="font-semibold text-white text-sm mb-0.5">
                  {notification.title || "Nueva notificación"}
                </h3>
                <p className="text-xs text-white/70 line-clamp-2">
                  {notification.message || "Toca para ver más detalles"}
                </p>
              </div>

              {/* Botón de cerrar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 
                          flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-white/70" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBanner;
