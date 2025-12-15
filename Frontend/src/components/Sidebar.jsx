import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CircleUserRound, History, KeyRound, Menu, X, HelpCircle, LogOut, BarChart3 } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Console from "../utils/console";

/**
 * Swiss Minimalist Premium Sidebar Component
 * 
 * Optimizations Applied:
 * - Uses .glass-panel-intense for profile card
 * - Uses .badge-success for online indicator
 * - Uses .divider-horizontal between sections
 * - Premium gradient rings for profile photo
 * - Optimized animations with spring physics
 * - Dark mode full support
 */
function Sidebar({ onToggle }) {
  const token = localStorage.getItem("token");
  const [showSidebar, setShowSidebar] = useState(false);
  const [newUser, setNewUser] = useState({});

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    setNewUser(userData);
  }, []);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    const newState = !showSidebar;
    setShowSidebar(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const logout = async () => {
    try {
      await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/${newUser.type}/logout`,
        {
          headers: {
            token: token,
          },
        }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("messages");
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      localStorage.removeItem("showPanel");
      localStorage.removeItem("showBtn");
      navigate("/");
    } catch (error) {
      Console.log("Error al cerrar sesión", error);
    }
  };

  const menuItems = [
    { to: `/${newUser?.type}/edit-profile`, icon: CircleUserRound, label: "Editar Perfil" },
    { to: `/${newUser?.type}/rides`, icon: History, label: "Historial de Viajes" },
    ...(newUser?.type === 'captain' ? [
      { to: `/captain/statistics`, icon: BarChart3, label: "📊 Estadísticas" }
    ] : []),
    { to: `/${newUser?.type}/reset-password?token=${token}`, icon: KeyRound, label: "Cambiar Contraseña" },
    { to: "/help", icon: HelpCircle, label: "Centro de Ayuda" },
  ];
  
  return (
    <>
      {/* Hamburger Menu Button - Premium Glass Style */}
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        style={{ zIndex: 9999 }}
        className="m-4 mt-5 absolute left-0 top-0 cursor-pointer rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 glass-panel"
        onClick={toggleSidebar}
      >
        <div className="p-3.5">
          {showSidebar ? (
            <X size={24} className="text-gray-700 dark:text-white" />
          ) : (
            <Menu size={24} className="text-gray-700 dark:text-white" />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/70 to-emerald-950/80 backdrop-blur-sm z-100"
              onClick={toggleSidebar}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={prefersReducedMotion ? {} : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={prefersReducedMotion ? {} : { x: "-100%" }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200 
              }}
              className="fixed w-full max-w-sm h-dvh top-0 left-0 z-200 pb-safe glass-panel-dark"
            >
              {/* Content */}
              <div className="relative h-full flex flex-col p-6 overflow-y-auto">
                {/* Premium Profile Card - Using .glass-panel-intense */}
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8 glass-panel-intense rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                >
                  {/* Profile Photo with Premium Gradient Ring */}
                  <div className="relative w-24 h-24 mx-auto mb-5">
                    {/* Animated gradient ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-400 to-cyan-500 p-1 animate-pulse">
                      {newUser?.data?.profileImage ? (
                        <img 
                          src={newUser.data.profileImage} 
                          alt="Profile" 
                          loading="lazy"
                          className="w-full h-full rounded-full object-cover ring-2 ring-white/20 dark:ring-white/30"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                          <span className="text-4xl text-white font-black">
                            {newUser?.data?.fullname?.firstname?.[0] || 'U'}
                            {newUser?.data?.fullname?.lastname?.[0] || ''}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Online Indicator - Using badge pattern */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-400 rounded-full border-4 border-slate-900 shadow-lg shadow-emerald-400/50 badge-success" />
                  </div>

                  {/* Name & Email */}
                  <h1 className="text-center font-bold text-xl text-white mb-1.5 whitespace-nowrap">
                    {newUser?.data?.fullname?.firstname}{" "}
                    {newUser?.data?.fullname?.lastname}
                  </h1>
                  
                  {/* Star Rating - Under Profile */}
                  {(newUser?.data?.rating?.average || newUser?.data?.rating) && (
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <span className="text-yellow-400 text-lg">⭐</span>
                      <span className="text-base font-bold text-yellow-400">
                        {(newUser?.data?.rating?.average || newUser?.data?.rating || 0).toFixed(1)}
                      </span>
                      {newUser?.data?.rating?.count > 0 && (
                        <span className="text-xs text-white/50">
                          ({newUser.data.rating.count})
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-center text-emerald-300 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis px-2">
                    {newUser?.data?.email}
                  </p>

                  {/* Role Badge */}
                  <div className="flex items-center justify-center gap-2 mt-3 bg-white/5 rounded-lg py-2 px-3 border border-white/10">
                    <span className="text-xs text-white/70 font-semibold uppercase tracking-wide whitespace-nowrap">
                      {newUser?.type === 'captain' ? '🚗 Conductor' : '👤 Pasajero'}
                    </span>
                  </div>
                </motion.div>

                {/* Divider - Using .divider-horizontal */}
                <div className="divider-horizontal mb-6" />

                {/* Navigation Links */}
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 space-y-3"
                >
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.to}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        to={item.to}
                        className="relative flex items-center justify-between py-4 px-4 cursor-pointer glass-panel hover:bg-white/10 dark:hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-xl transition-all duration-200 group overflow-hidden"
                        onClick={toggleSidebar}
                      >
                        {/* Active indicator - vertical glow bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-l-xl" />
                        
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all">
                            <item.icon size={20} className="text-emerald-400" />
                          </div>
                          <span className="text-white font-medium whitespace-nowrap">{item.label}</span>
                        </div>
                        <ChevronRight size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Divider before logout */}
                <div className="divider-horizontal my-6" />

                {/* Logout Button */}
                <motion.button
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  onClick={logout}
                  className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  Cerrar Sesión
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;