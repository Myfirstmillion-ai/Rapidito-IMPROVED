import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Languages,
  Map
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, shadows, glassEffect, borderRadius } from "../styles/designSystem";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { useUser } from "../contexts/UserContext";
import { useCaptain } from "../contexts/CaptainContext";
import Console from "../utils/console";

// Variantes de animación para iOS Deluxe
const animationVariants = {
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  },
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },
  itemFadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  }
};

function Settings() {
  const navigation = useNavigate();
  const { user, logout: userLogout } = useUser();
  const { captain, logout: captainLogout } = useCaptain();
  
  // Determinar si el usuario es un captain o un usuario normal
  const isCaptain = !!captain;
  const currentUser = isCaptain ? captain : user;
  
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [language, setLanguage] = useState("es");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Comprobar preferencias del sistema para el dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
    
    // Podríamos cargar preferencias del usuario desde localStorage o API
    const storedPreferences = localStorage.getItem("userPreferences");
    if (storedPreferences) {
      try {
        const preferences = JSON.parse(storedPreferences);
        setDarkMode(preferences.darkMode || prefersDarkMode);
        setNotificationsEnabled(preferences.notifications !== false);
        setLanguage(preferences.language || "es");
      } catch (e) {
        Console.log("Error parsing stored preferences:", e);
      }
    }
  }, []);

  // Guardar preferencias cuando cambien
  useEffect(() => {
    const preferences = {
      darkMode,
      notifications: notificationsEnabled,
      location: locationEnabled,
      language
    };
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
  }, [darkMode, notificationsEnabled, locationEnabled, language]);

  const handleLogout = () => {
    if (isCaptain) {
      captainLogout();
    } else {
      userLogout();
    }
    navigation("/");
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);
  const toggleLocation = () => setLocationEnabled(!locationEnabled);

  const settingsSections = [
    {
      title: "Cuenta",
      items: [
        {
          id: "profile",
          icon: <Badge variant="avatar" imageUrl={currentUser?.profileImage} />,
          title: "Perfil",
          subtitle: `${currentUser?.fullname?.firstname} ${currentUser?.fullname?.lastname}`,
          action: () => navigation(isCaptain ? "/captain/profile/edit" : "/profile/edit"),
          showChevron: true
        },
        {
          id: "payment",
          icon: <CreditCard size={20} className="text-white/70" />,
          title: "Métodos de pago",
          subtitle: "Administrar tarjetas",
          action: () => navigation("/payment-methods"),
          showChevron: true
        }
      ]
    },
    {
      title: "Preferencias",
      items: [
        {
          id: "darkMode",
          icon: darkMode ? <Moon size={20} className="text-white/70" /> : <Sun size={20} className="text-white/70" />,
          title: "Modo oscuro",
          subtitle: darkMode ? "Activado" : "Desactivado",
          action: toggleDarkMode,
          toggle: true,
          isActive: darkMode
        },
        {
          id: "notifications",
          icon: <Bell size={20} className="text-white/70" />,
          title: "Notificaciones",
          subtitle: notificationsEnabled ? "Activadas" : "Desactivadas",
          action: toggleNotifications,
          toggle: true,
          isActive: notificationsEnabled
        },
        {
          id: "location",
          icon: <Map size={20} className="text-white/70" />,
          title: "Ubicación",
          subtitle: locationEnabled ? "Activada" : "Desactivada",
          action: toggleLocation,
          toggle: true,
          isActive: locationEnabled
        },
        {
          id: "language",
          icon: <Languages size={20} className="text-white/70" />,
          title: "Idioma",
          subtitle: language === "es" ? "Español" : "English",
          action: () => setLanguage(language === "es" ? "en" : "es"),
          showChevron: true
        }
      ]
    },
    {
      title: "Soporte",
      items: [
        {
          id: "help",
          icon: <HelpCircle size={20} className="text-white/70" />,
          title: "Ayuda",
          subtitle: "Preguntas frecuentes",
          action: () => navigation("/help"),
          showChevron: true
        },
        {
          id: "privacy",
          icon: <Shield size={20} className="text-white/70" />,
          title: "Privacidad y seguridad",
          subtitle: "Términos y políticas",
          action: () => navigation("/privacy"),
          showChevron: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#080808] overflow-y-auto pb-20">
      {/* Header - iOS Deluxe */}
      <motion.div
        variants={animationVariants.fadeInDown}
        initial="initial"
        animate="animate"
        className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10"
      >
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            variant="glass"
            size="icon"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigation(-1)}
            aria-label="Volver"
          />
          <h1 className="text-2xl font-bold text-white">
            Configuración
          </h1>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Secciones de ajustes */}
        <motion.div 
          variants={animationVariants.staggerChildren}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {settingsSections.map((section, sectionIndex) => (
            <motion.div 
              key={section.title}
              variants={animationVariants.itemFadeIn}
              className="space-y-3"
            >
              <h2 className="text-sm font-semibold text-white/70 px-1">{section.title}</h2>
              
              <Card
                variant="glass"
                className="overflow-hidden backdrop-blur-md border border-white/10"
              >
                {section.items.map((item, i) => (
                  <div 
                    key={item.id}
                    className={`px-4 py-4 flex items-center gap-3 ${
                      i !== section.items.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  >
                    {/* Icono */}
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    
                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-white/50">{item.subtitle}</p>
                    </div>
                    
                    {/* Acción */}
                    {item.toggle ? (
                      <div 
                        onClick={item.action}
                        className={`w-12 h-7 rounded-full transition-colors cursor-pointer flex items-center ${
                          item.isActive ? "bg-[#10B981]" : "bg-white/20"
                        }`}
                      >
                        <motion.div 
                          animate={{ x: item.isActive ? 20 : 4 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="w-5 h-5 bg-white rounded-full shadow-md"
                        />
                      </div>
                    ) : item.showChevron ? (
                      <ChevronRight 
                        size={18} 
                        className="text-white/40 flex-shrink-0"
                        onClick={item.action}
                      />
                    ) : null}
                  </div>
                ))}
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Logout Button */}
        <div className="pt-6">
          <Button
            variant="glass"
            size="large"
            title="Cerrar sesión"
            icon={<LogOut size={18} />}
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-white/5 hover:bg-white/10 text-red-400 hover:text-red-300 border border-red-500/20"
          />
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm"
            >
              <Card
                variant="floating"
                className="p-6 text-center"
              >
                <h3 className="text-xl font-bold text-white mb-2">Cerrar sesión</h3>
                <p className="text-white/70 mb-6">
                  ¿Estás seguro que deseas cerrar sesión?
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="glass"
                    size="large"
                    title="Cancelar"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1"
                  />
                  <Button
                    variant="destructive"
                    size="large"
                    title="Cerrar sesión"
                    onClick={handleLogout}
                    className="flex-1"
                  />
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;
