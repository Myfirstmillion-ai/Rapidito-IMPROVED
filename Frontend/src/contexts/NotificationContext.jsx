import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Sonido de notificación
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

export const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications debe ser usado dentro de un NotificationProvider");
  }
  return context;
};

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  MESSAGE: "message",
  RIDE_REQUEST: "ride_request",
  RIDE_UPDATE: "ride_update",
  PAYMENT: "payment",
  PROMO: "promo",
};

// Categorías de notificaciones
export const NOTIFICATION_CATEGORIES = {
  SYSTEM: "system",
  RIDE: "ride",
  CHAT: "chat",
  PAYMENT: "payment",
  PROMO: "promo",
};

export function NotificationProvider({ children }) {
  // Estado para todas las notificaciones
  const [notifications, setNotifications] = useState([]);
  
  // Estado para la notificación activa (la que se muestra como banner)
  const [activeNotification, setActiveNotification] = useState(null);
  
  // Estado para el centro de notificaciones
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  
  // Estado para preferencias de notificaciones
  const [notificationPreferences, setNotificationPreferences] = useState({
    enableSound: true,
    enableVibration: true,
    doNotDisturb: false,
    categories: {
      system: true,
      ride: true,
      chat: true,
      payment: true,
      promo: true,
    },
  });

  const navigate = useNavigate();

  // Cargar notificaciones y preferencias desde localStorage al iniciar
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (error) {
        console.error("Error parsing stored notifications:", error);
      }
    }

    const storedPreferences = localStorage.getItem("notificationPreferences");
    if (storedPreferences) {
      try {
        setNotificationPreferences(JSON.parse(storedPreferences));
      } catch (error) {
        console.error("Error parsing stored notification preferences:", error);
      }
    }
  }, []);

  // Guardar notificaciones cuando cambien
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Guardar preferencias cuando cambien
  useEffect(() => {
    localStorage.setItem("notificationPreferences", JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  // Reproducir sonido de notificación
  const playNotificationSound = useCallback(() => {
    if (!notificationPreferences.enableSound) return;
    
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.play().catch(err => console.error("Error playing notification sound:", err));
    } catch (error) {
      console.error("Error creating audio element:", error);
    }
  }, [notificationPreferences.enableSound]);

  // Vibrar dispositivo
  const vibrate = useCallback(() => {
    if (!notificationPreferences.enableVibration) return;
    
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  }, [notificationPreferences.enableVibration]);

  // Agregar una nueva notificación
  const addNotification = useCallback((notification) => {
    // Verificar si las notificaciones están desactivadas (modo no molestar)
    if (notificationPreferences.doNotDisturb) return;
    
    // Verificar si la categoría está habilitada
    if (!notificationPreferences.categories[notification.category]) return;
    
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    // Actualizar la lista de notificaciones
    setNotifications(prev => [newNotification, ...prev]);
    
    // Mostrar como banner si no hay una notificación activa
    if (!activeNotification) {
      setActiveNotification(newNotification);
      
      // Efectos de notificación
      playNotificationSound();
      vibrate();
      
      // Auto-cerrar el banner después de 5 segundos
      setTimeout(() => {
        setActiveNotification(null);
      }, 5000);
    }
    
    return newNotification.id;
  }, [activeNotification, notificationPreferences, playNotificationSound, vibrate]);

  // Marcar una notificación como leída
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true } 
          : notif
      )
    );
  }, []);

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  // Eliminar una notificación
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
    
    if (activeNotification?.id === notificationId) {
      setActiveNotification(null);
    }
  }, [activeNotification]);

  // Eliminar todas las notificaciones
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setActiveNotification(null);
  }, []);

  // Actualizar preferencias de notificaciones
  const updateNotificationPreferences = useCallback((preferences) => {
    setNotificationPreferences(prev => ({
      ...prev,
      ...preferences
    }));
  }, []);

  // Abrir/cerrar el centro de notificaciones
  const toggleNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen(prev => !prev);
  }, []);

  const closeNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen(false);
  }, []);

  // Cerrar la notificación activa (banner)
  const dismissActiveNotification = useCallback(() => {
    if (activeNotification) {
      markAsRead(activeNotification.id);
      setActiveNotification(null);
    }
  }, [activeNotification, markAsRead]);

  // Manejar click en una notificación
  const handleNotificationClick = useCallback((notification) => {
    markAsRead(notification.id);
    
    // Cerrar el centro de notificaciones
    closeNotificationCenter();
    
    // Navegar según el tipo de notificación
    if (notification.action?.type === "navigate" && notification.action.path) {
      navigate(notification.action.path);
    }
    
    // Ejecutar cualquier acción personalizada
    if (notification.action?.callback && typeof notification.action.callback === "function") {
      notification.action.callback();
    }
  }, [markAsRead, closeNotificationCenter, navigate]);

  // Cantidad de notificaciones no leídas
  const unreadCount = notifications.filter(notif => !notif.read).length;
  
  // Agrupar notificaciones por fecha
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const isToday = (dateStr) => {
      const date = new Date(dateStr);
      return date.toDateString() === today.toDateString();
    };
    
    const isYesterday = (dateStr) => {
      const date = new Date(dateStr);
      return date.toDateString() === yesterday.toDateString();
    };
    
    return {
      today: notifications.filter(n => isToday(n.timestamp)),
      yesterday: notifications.filter(n => isYesterday(n.timestamp)),
      older: notifications.filter(n => !isToday(n.timestamp) && !isYesterday(n.timestamp))
    };
  }, [notifications]);

  // Notificación de ejemplo para pruebas de desarrollo
  const addTestNotification = useCallback(() => {
    const types = Object.values(NOTIFICATION_TYPES);
    const categories = Object.values(NOTIFICATION_CATEGORIES);
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    addNotification({
      title: `Notificación de prueba (${randomType})`,
      message: `Esta es una notificación de prueba de tipo ${randomType} y categoría ${randomCategory}. Creada en ${new Date().toLocaleTimeString()}.`,
      type: randomType,
      category: randomCategory,
      action: {
        type: "navigate",
        path: "/settings"
      }
    });
  }, [addNotification]);

  const value = {
    notifications,
    activeNotification,
    isNotificationCenterOpen,
    notificationPreferences,
    unreadCount,
    groupedNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    updateNotificationPreferences,
    toggleNotificationCenter,
    closeNotificationCenter,
    dismissActiveNotification,
    handleNotificationClick,
    addTestNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
