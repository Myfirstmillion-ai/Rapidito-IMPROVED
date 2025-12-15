import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useContext, useState } from "react";
import { logger } from "./utils/logger";
import { SocketDataContext } from "./contexts/SocketContext";
import { ChevronLeft, Trash2 } from "lucide-react";
import ToastProvider from "./components/notifications/ToastProvider";
import RatingModalWrapper from "./components/RatingModalWrapper";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import NotificationProvider from "./contexts/NotificationContext";
import NotificationBanner from "./components/NotificationBanner";
import NotificationCenter from "./components/NotificationCenter";
import { springs, pageTransitions, shouldReduceMotion } from "./utils/animationUtils";
import InstallPWA from "./components/InstallPWA";

// LOW-006: Lazy loading for route components to reduce initial bundle size
// Critical components loaded eagerly
import {
  GetStarted,
  UserLogin,
  CaptainLogin,
  UserProtectedWrapper,
  CaptainProtectedWrapper,
  Error,
} from "./screens/";

// Non-critical components loaded lazily
const UserHomeScreen = lazy(() => import("./screens/UserHomeScreen"));
const CaptainHomeScreen = lazy(() => import("./screens/CaptainHomeScreen"));
const UserSignup = lazy(() => import("./screens/UserSignup"));
const CaptainSignup = lazy(() => import("./screens/CaptainSignup"));
const RideHistory = lazy(() => import("./screens/RideHistory"));
const UserEditProfile = lazy(() => import("./screens/UserEditProfile"));
const CaptainEditProfile = lazy(() => import("./screens/CaptainEditProfile"));
const ChatScreen = lazy(() => import("./screens/ChatScreen"));
const VerifyEmail = lazy(() => import("./components/VerifyEmail"));
const ResetPassword = lazy(() => import("./screens/ResetPassword"));
const ForgotPassword = lazy(() => import("./screens/ForgotPassword"));
const AboutUs = lazy(() => import("./screens/AboutUs"));
const Blog = lazy(() => import("./screens/Blog"));
const Careers = lazy(() => import("./screens/Careers"));
const Terms = lazy(() => import("./screens/Terms"));
const Privacy = lazy(() => import("./screens/Privacy"));
const Help = lazy(() => import("./screens/Help"));
const AdminDashboard = lazy(() => import("./screens/AdminDashboard"));
const OAuthCallback = lazy(() => import("./screens/OAuthCallback"));
const CompleteProfile = lazy(() => import("./screens/CompleteProfile"));
const Settings = lazy(() => import("./screens/Settings"));

// Importar LoadingIndicator
import LoadingIndicator from "./components/common/LoadingIndicator";

// Loading fallback component con estilo iOS Deluxe
const LazyLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#080808]">
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Logo de la app */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="text-3xl font-bold text-white mb-4"
      >
        Rapi-dito
      </motion.div>
      
      {/* Indicador de carga */}
      <LoadingIndicator 
        type="spinner" 
        size="large" 
        color="#10B981" 
        text="Cargando experiencia iOS Deluxe..." 
      />
    </div>
  </div>
);

function App() {
  return (
    <div className="w-full min-h-screen-safe flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 overflow-x-hidden">
      <InstallPWA />
      <div className="relative w-full sm:min-w-[400px] sm:max-w-[430px] md:max-w-[400px] min-h-screen-safe sm:h-[95vh] sm:max-h-[900px] bg-white overflow-x-hidden overflow-y-auto sm:rounded-3xl sm:shadow-2xl transition-all duration-300 ease-in-out">
        {/* Botón de reseteo de emergencia */}
        <div className="absolute top-36 -right-11 opacity-20 hover:opacity-100 z-50 flex items-center p-1 PL-0 gap-1 bg-zinc-50 border-2 border-r-0 border-gray-300 hover:-translate-x-11 rounded-l-md transition-all duration-300">
          <ChevronLeft />
          <button className="flex justify-center items-center w-10 h-10 rounded-lg border-2 border-red-300 bg-red-200 text-red-500" onClick={() => {
            alert("Esto borrará todos tus datos y cerrará sesión para arreglar la app en caso de que esté corrupta. Por favor confirma para continuar.");
            const confirmation = confirm("¿Estás seguro de que quieres resetear la app?")

            if (confirmation === true) {
              localStorage.clear();
              window.location.reload();
            }
          }}>
            <Trash2 strokeWidth={1.8} width={18} />
          </button>
        </div>

        <BrowserRouter>
          <NotificationProvider>
            <ToastProvider />
            <RatingModalWrapper />
            <NotificationManager />
            <LoggingWrapper />
            <AnimatedRoutes />
          </NotificationProvider>
        </BrowserRouter>
      </div>
      {/* Imagen lateral para pantallas grandes */}
      <div className="hidden lg:block w-full max-w-xl h-[95vh] max-h-[900px] bg-gradient-to-br from-green-400 to-green-600 overflow-hidden select-none rounded-3xl ml-4 shadow-2xl">
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white">
          <h1 className="text-4xl font-bold mb-4 text-center">Rapidito</h1>
          <p className="text-xl text-center text-green-100 mb-8">Tu viaje rápido y seguro</p>
          <img
            className="h-80 object-contain mx-auto select-none drop-shadow-2xl"
            src="https://img.freepik.com/free-vector/taxi-app-service-concept_23-2148497472.jpg?semt=ais_hybrid"
            alt="Imagen lateral"
            loading="lazy"
            decoding="async"
          />
          <div className="mt-8 text-center">
            <p className="text-green-100 text-sm">Disponible en la frontera</p>
            <p className="text-green-200 text-xs mt-2">San Antonio del Táchira • Cúcuta • Villa del Rosario</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

function AnimatedRoutes() {
  const location = useLocation();
  const [transitionType, setTransitionType] = useState('default');
  const reduceMotion = shouldReduceMotion();
  
  // Determinar el tipo de transición basado en la ruta
  useEffect(() => {
    // Por defecto usamos la transición deslizante
    let newTransitionType = 'default';
    
    // Para pantallas modales o de configuración usamos la transición tipo slide
    if (location.pathname.includes('/settings') || 
        location.pathname.includes('/edit-profile') || 
        location.pathname.includes('/chat')) {
      newTransitionType = 'slide';
    }
    
    // Para pantallas de auth usamos fade
    if (location.pathname.includes('/login') || 
        location.pathname.includes('/signup') || 
        location.pathname === '/') {
      newTransitionType = 'fade';
    }
    
    setTransitionType(newTransitionType);
  }, [location.pathname]);
  
  // Obtener la configuración de transición adecuada
  const transition = reduceMotion 
    ? { duration: 0.15 } // Transición mínima si el usuario prefiere movimiento reducido
    : { ...springs.default, ...pageTransitions[transitionType].transition };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? { opacity: 0 } : pageTransitions[transitionType].initial}
        animate={reduceMotion ? { opacity: 1 } : pageTransitions[transitionType].animate}
        exit={reduceMotion ? { opacity: 0 } : pageTransitions[transitionType].exit}
        transition={transition}
      >
        {/* LOW-006: Wrap routes with Suspense for lazy loading */}
        <Suspense fallback={<LazyLoadingFallback />}>
        <Routes location={location}>
          <Route path="/" element={<GetStarted />} />
          <Route
            path="/home"
            element={
              <UserProtectedWrapper>
                <UserHomeScreen />
              </UserProtectedWrapper>
            }
          />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route
            path="/user/edit-profile"
            element={
              <UserProtectedWrapper>
                <UserEditProfile />
              </UserProtectedWrapper>
            }
          />
          <Route
            path="/user/rides"
            element={
              <UserProtectedWrapper>
                <RideHistory />
              </UserProtectedWrapper>
            }
          />

          <Route
            path="/captain/home"
            element={
              <CaptainProtectedWrapper>
                <CaptainHomeScreen />
              </CaptainProtectedWrapper>
            }
          />
          <Route path="/captain/login" element={<CaptainLogin />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/captain/signup" element={<CaptainSignup />} />
          <Route
            path="/captain/edit-profile"
            element={
              <CaptainProtectedWrapper>
                <CaptainEditProfile />
              </CaptainProtectedWrapper>
            }
          />
          <Route
            path="/captain/rides"
            element={
              <CaptainProtectedWrapper>
                <RideHistory />
              </CaptainProtectedWrapper>
            }
          />
          <Route path="/:userType/chat/:rideId" element={
            <ErrorBoundary>
              <ChatScreen />
            </ErrorBoundary>
          } />
          <Route path="/:userType/verify-email/" element={<VerifyEmail />} />
          <Route path="/:userType/forgot-password/" element={<ForgotPassword />} />
          <Route path="/:userType/reset-password/" element={<ResetPassword />} />

          {/* Information pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/help" element={<Help />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="*" element={<Error />} />
        </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function LoggingWrapper() {
  const location = useLocation();
  const { socket } = useContext(SocketDataContext);

  useEffect(() => {
    if (socket) {
      logger(socket);
    }
  }, [location.pathname, location.search, socket]);
  return null;
}

function NotificationManager() {
  const { activeNotification, handleNotificationClick, dismissActiveNotification, isNotificationCenterOpen } = useContext(NotificationContext);

  return (
    <>
      <NotificationBanner 
        notification={activeNotification}
        onClose={dismissActiveNotification}
        onTap={() => handleNotificationClick(activeNotification)}
      />
      <AnimatePresence>
        {isNotificationCenterOpen && <NotificationCenter />}
      </AnimatePresence>
    </>
  );
}
