import { useContext, useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import toast from "react-hot-toast";
import { useCaptain } from "../contexts/CaptainContext";
import { SocketDataContext } from "../contexts/SocketContext";
import { NewRide, Sidebar } from "../components";
import MapboxStaticMap from "../components/maps/MapboxStaticMap";
import MessageNotificationBanner from "../components/ui/MessageNotificationBanner";
import { showRideRequestToast } from "../components/notifications/RideRequestToast";
import { useNavigate } from "react-router-dom";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";
import { Alert } from "../components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu,
  Plus,
  Minus,
  Compass,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  Star,
  Target,
  CheckCircle,
  ShieldCheck,
  Car,
  ArrowRight,
  User as UserIcon
} from "lucide-react";

// Import design system components
import { colors, shadows, glassEffect, borderRadius } from "../styles/designSystem";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Badge from "../components/common/Badge";

// Coordenadas de San Antonio del Táchira
const DEFAULT_LOCATION = {
  lat: 7.8146,
  lng: -72.4430
};

// URLs de sonidos de notificación
const NOTIFICATION_SOUNDS = {
  newRide: "https://assets.mixkit.co/active_storage/sfx/2645/2645-preview.mp3",
  rideAccepted: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  rideEnded: "https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3",
  newMessage: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"
};

const playSound = (soundUrl) => {
  try {
    const audio = new Audio(soundUrl);
    audio.volume = 0.6;
    audio.play().catch(e => Console.log("Error reproduciendo sonido:", e));
  } catch (e) {
    Console.log("Error con audio:", e);
  }
};

const vibrate = (pattern = [200, 100, 200]) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

const defaultRideData = {
  user: {
    fullname: {
      firstname: "Sin",
      lastname: "Usuario",
    },
    _id: "",
    email: "ejemplo@gmail.com",
    rides: [],
  },
  pickup: "Lugar, Ciudad, Estado, País",
  destination: "Lugar, Ciudad, Estado, País",
  fare: 0,
  vehicle: "car",
  status: "pending",
  duration: 0,
  distance: 0,
  _id: "123456789012345678901234",
};

function CaptainHomeScreen() {
  const token = localStorage.getItem("token");
  const { captain, setCaptain } = useCaptain();
  const { socket } = useContext(SocketDataContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { alert, showAlert, hideAlert } = useAlert();
  
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showMessageBanner, setShowMessageBanner] = useState(false);
  const [lastMessage, setLastMessage] = useState({ sender: "", text: "" });

  const [riderLocation, setRiderLocation] = useState({
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng,
  });
  const [mapCenter, setMapCenter] = useState({
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng
  });
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
  });

  const [rides, setRides] = useState({
    accepted: 0,
    cancelled: 0,
    distanceTravelled: 0,
  });
  const [newRide, setNewRide] = useState(
    JSON.parse(localStorage.getItem("rideDetails")) || defaultRideData
  );

  const [otp, setOtp] = useState("");
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [error, setError] = useState("");
  const [showRideCompleted, setShowRideCompleted] = useState(false);
  const [completedRideData, setCompletedRideData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentRideStatus, setCurrentRideStatus] = useState("pending");
  const locationUpdateInterval = useRef(null);

  const activeRideToastsRef = useRef(new Map());
  // CRITICAL-FIX: Ref to track latest ride data to avoid stale closures in callbacks
  const newRideRef = useRef(newRide);

  const [showCaptainDetailsPanel, setShowCaptainDetailsPanel] = useState(true);
  const [showNewRidePanel, setShowNewRidePanel] = useState(
    JSON.parse(localStorage.getItem("showPanel")) || false
  );
  const [showBtn, setShowBtn] = useState(
    JSON.parse(localStorage.getItem("showBtn")) || "accept"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(14);
  const [isLocating, setIsLocating] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Animation variants with iOS spring physics
  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.2
      }
    }
  };

  const fadeInUp = {
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 40 },
    animate: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 }
  };

  const fadeInDown = {
    initial: prefersReducedMotion ? {} : { opacity: 0, y: -40 },
    animate: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 }
  };

  const fadeInRight = {
    initial: prefersReducedMotion ? {} : { opacity: 0, x: -40 },
    animate: prefersReducedMotion ? {} : { opacity: 1, x: 0 },
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 }
  };

  const scaleIn = {
    initial: prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 },
    animate: prefersReducedMotion ? {} : { opacity: 1, scale: 1 },
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 }
  };

  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
  };

  const refreshCaptainData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/captain/profile`,
        {
          headers: { token: token }
        }
      );
      if (response.data.captain) {
        setCaptain(response.data.captain);
        localStorage.setItem("userData", JSON.stringify({
          type: "captain",
          data: response.data.captain,
        }));
      }
    } catch (error) {
      Console.log("Error refrescando datos:", error);
    }
  };

  // CRITICAL-FIX: Keep ref in sync with state
  useEffect(() => {
    newRideRef.current = newRide;
  }, [newRide]);

  // CRITICAL-FIX: Accept optional rideId to avoid stale closure
  const acceptRide = async (rideIdOverride) => {
    // Use override if provided, otherwise use ref (always has latest value)
    const rideId = rideIdOverride || newRideRef.current._id;

    try {
      if (rideId && rideId !== "" && rideId !== "123456789012345678901234") {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/confirm`,
          { rideId: rideId },
          {
            headers: {
              token: token,
            },
          }
        );
        setLoading(false);
        setShowBtn("otp");
        setCurrentRideStatus("accepted");

        vibrate([200, 100, 200]);
        playSound(NOTIFICATION_SOUNDS.rideAccepted);

        setMapCenter({
          lat: riderLocation.lat,
          lng: riderLocation.lng
        });
        Console.log(response);
      } else {
        Console.error("acceptRide called with invalid rideId:", rideId);
      }
    } catch (error) {
      setLoading(false);
      showAlert('Ocurrió un error', error.response?.data?.message || 'Error desconocido', 'failure');
      Console.log(error.response);
      setTimeout(() => {
        clearRideData();
      }, 1000);
    }
  };

  const verifyOTP = async () => {
    try {
      if (newRide._id !== "" && otp.length === 6) {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/ride/start-ride?rideId=${newRide._id}&otp=${otp}`,
          {
            headers: {
              token: token,
            },
          }
        );
        setMapCenter({
          lat: riderLocation.lat,
          lng: riderLocation.lng
        });
        setShowBtn("end-ride");
        setCurrentRideStatus("ongoing");
        setLoading(false);
        Console.log(response);
      }
    } catch (err) {
      setLoading(false);
      setError("OTP inválido");
      Console.log(err);
    }
  };

  const endRide = async () => {
    try {
      if (newRide._id !== "") {
        setLoading(true);
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/end-ride`,
          {
            rideId: newRide._id,
          },
          {
            headers: {
              token: token,
            },
          }
        );
        
        setCompletedRideData({
          fare: newRide.fare,
          pickup: newRide.pickup,
          destination: newRide.destination,
          distance: newRide.distance
        });
        
        vibrate([300, 150, 300, 150, 300]);
        playSound(NOTIFICATION_SOUNDS.rideEnded);
        
        setShowRideCompleted(true);
        
        setMapCenter({
          lat: riderLocation.lat,
          lng: riderLocation.lng
        });
        setShowBtn("accept");
        setCurrentRideStatus("pending");
        setLoading(false);
        setShowCaptainDetailsPanel(false);
        setShowNewRidePanel(false);
        setNewRide(defaultRideData);
        localStorage.removeItem("rideDetails");
        localStorage.removeItem("showPanel");
        localStorage.removeItem("messages");
        
        await refreshCaptainData();
      }
    } catch (err) {
      setLoading(false);
      Console.log(err);
    }
  };

  const cancelRide = async () => {
    try {
      if (newRide._id !== "") {
        setLoading(true);
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/cancel`,
          {
            rideId: newRide._id,
          },
          {
            headers: {
              token: token,
            },
          }
        );
        
        setLoading(false);
        showAlert('Viaje cancelado', 'El viaje ha sido cancelado exitosamente', 'success');
        
        clearRideData();
      }
    } catch (err) {
      setLoading(false);
      showAlert('Error', err.response?.data?.message || 'No se pudo cancelar el viaje', 'failure');
      Console.log(err);
    }
  };

  const closeRideCompleted = () => {
    setShowRideCompleted(false);
    setCompletedRideData(null);
    setShowCaptainDetailsPanel(true);
  };

  const updateLocation = () => {
    if (navigator.geolocation && captain?._id && socket) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          setRiderLocation(location);
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });

          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          socket.emit("update-location-captain", {
            userId: captain._id,
            location: location,
          });
        },
        (error) => {
          console.error("Error obteniendo posición:", error);
          setMapCenter({
            lat: DEFAULT_LOCATION.lat,
            lng: DEFAULT_LOCATION.lng
          });
        }
      );
    }
  };

  const clearRideData = () => {
    setShowBtn("accept");
    setLoading(false);
    setShowCaptainDetailsPanel(true);
    setShowNewRidePanel(false);
    setNewRide(defaultRideData);
    setCurrentRideStatus("pending");
    localStorage.removeItem("rideDetails");
    localStorage.removeItem("showPanel");
  };

  const saveMessagesDebounced = useMemo(
    () => debounce((messages) => {
      localStorage.setItem("messages", JSON.stringify(messages));
    }, 1000),
    []
  );

  const saveRideDetailsDebounced = useMemo(
    () => debounce((rideDetails) => {
      localStorage.setItem("rideDetails", JSON.stringify(rideDetails));
    }, 500),
    []
  );

  const savePanelStateDebounced = useMemo(
    () => debounce((showPanel, showBtnState) => {
      localStorage.setItem("showPanel", JSON.stringify(showPanel));
      localStorage.setItem("showBtn", JSON.stringify(showBtnState));
    }, 500),
    []
  );

  // Socket connection and location updates
  useEffect(() => {
    if (captain?._id && socket) {
      socket.emit("join", {
        userId: captain._id,
        userType: "captain",
      });

      updateLocation();
      
      const locationInterval = setInterval(updateLocation, 30000);
      
      let activeRideLocationInterval = null;
      let locationWatchId = null;
      
      // Professional tracking: Use watchPosition for active rides
      if (showBtn === "otp" || showBtn === "end-ride") {
        const trackingInterval = parseInt(import.meta.env.VITE_TRACKING_UPDATE_INTERVAL) || 4000;
        let lastUpdateTime = 0;
        
        locationWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const now = Date.now();
            // Throttle updates to configured interval
            if (now - lastUpdateTime < trackingInterval) return;
            lastUpdateTime = now;
            
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            
            setRiderLocation(location);
            setCurrentLocation(location);
            
            // Send enhanced location data for professional tracking
            socket.emit("driver:locationUpdate", {
              driverId: captain._id,
              location,
              rideId: newRide._id,
              heading: position.coords.heading || 0,
              speed: position.coords.speed ? position.coords.speed * 3.6 : 0, // m/s to km/h
              accuracy: position.coords.accuracy || 0,
              timestamp: now,
            });
            
            Console.log("Ubicación enviada:", location);
          },
          (error) => {
            Console.log("Error obteniendo ubicación:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
          }
        );
      }
      
      const handleNewRide = (data) => {
        Console.log("Nuevo viaje disponible:", data);

        if (data.isLateJoinOffer) {
          Console.log(`[LateJoiner] Received pending ride with ${data.timeRemaining}s remaining`);
        }

        vibrate([500, 200, 500, 200, 500]);
        playSound(NOTIFICATION_SOUNDS.newRide);

        setShowBtn("accept");
        setNewRide(data);
        setShowNewRidePanel(true);

        // CRITICAL-FIX: Pass rideId directly to avoid stale closure issue
        const rideId = data._id;
        const toastId = showRideRequestToast(
          data,
          () => {
            acceptRide(rideId); // Pass rideId directly
            activeRideToastsRef.current.delete(rideId);
          },
          () => {
            Console.log("Viaje rechazado por el conductor");
            activeRideToastsRef.current.delete(rideId);
          },
          data.timeRemaining
        );

        activeRideToastsRef.current.set(rideId, toastId);
      };

      const handleRideCancelled = (data) => {
        Console.log("Viaje cancelado", data);
        
        const toastId = activeRideToastsRef.current.get(data.rideId);
        if (toastId) {
          toast.dismiss(toastId);
          activeRideToastsRef.current.delete(data.rideId);
        }
        
        updateLocation();
        clearRideData();
      };
      
      const handleRideTaken = (data) => {
        Console.log("Viaje tomado por otro conductor", data);
        
        const toastId = activeRideToastsRef.current.get(data.rideId);
        if (toastId) {
          toast.dismiss(toastId);
          activeRideToastsRef.current.delete(data.rideId);
        }
        
        if (newRide?._id === data.rideId) {
          clearRideData();
        }
      };

      socket.on("new-ride", handleNewRide);
      socket.on("ride-cancelled", handleRideCancelled);
      socket.on("ride-taken", handleRideTaken);
      
      return () => {
        clearInterval(locationInterval);
        if (activeRideLocationInterval) {
          clearInterval(activeRideLocationInterval);
        }
        if (locationWatchId !== null) {
          navigator.geolocation.clearWatch(locationWatchId);
        }
        socket.off("new-ride", handleNewRide);
        socket.off("ride-cancelled", handleRideCancelled);
        socket.off("ride-taken", handleRideTaken);
      };
    }
  }, [captain?._id, socket, showBtn, newRide._id]);

  useEffect(() => {
    saveMessagesDebounced(messages);
  }, [messages, saveMessagesDebounced]);

  useEffect(() => {
    if (socket && newRide._id && newRide._id !== "123456789012345678901234") {
      socket.emit("join-room", newRide._id);

      const handleReceiveMessage = (data) => {
        const messageText = typeof data === 'string' ? data : (data?.msg || '');
        const messageBy = typeof data === 'string' ? 'other' : (data?.by || 'other');
        const messageTime = typeof data === 'string' ? '' : (data?.time || '');
        
        setMessages((prev) => [...prev, { msg: messageText, by: messageBy, time: messageTime }]);
        setUnreadMessages((prev) => prev + 1);
        
        setLastMessage({
          sender: newRide?.user?.fullname?.firstname || "Pasajero",
          text: messageText
        });
        
        setShowMessageBanner(true);
        playSound(NOTIFICATION_SOUNDS.newMessage);
        vibrate([200, 100, 200]);
      };

      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [newRide._id, socket]);

  useEffect(() => {
    saveRideDetailsDebounced(newRide);
  }, [newRide, saveRideDetailsDebounced]);

  useEffect(() => {
    savePanelStateDebounced(showNewRidePanel, showBtn);
  }, [showNewRidePanel, showBtn, savePanelStateDebounced]);

  // Calcular ganancias
  useEffect(() => {
    if (captain?.rides && Array.isArray(captain.rides)) {
      let Totalearnings = 0;
      let Todaysearning = 0;
      let acceptedRides = 0;
      let cancelledRides = 0;
      let distanceTravelled = 0;

      const today = new Date();
      const todayWithoutTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      captain.rides.forEach((ride) => {
        if (ride.status === "completed") {
          acceptedRides++;
          distanceTravelled += ride.distance || 0;
          Totalearnings += ride.fare || 0;
          
          const rideDate = new Date(ride.updatedAt);
          const rideDateWithoutTime = new Date(
            rideDate.getFullYear(),
            rideDate.getMonth(),
            rideDate.getDate()
          );

          if (rideDateWithoutTime.getTime() === todayWithoutTime.getTime()) {
            Todaysearning += ride.fare || 0;
          }
        }
        if (ride.status === "cancelled") cancelledRides++;
      });

      setEarnings({ total: Totalearnings, today: Todaysearning });
      setRides({
        accepted: acceptedRides,
        cancelled: cancelledRides,
        distanceTravelled: Math.round(distanceTravelled / 1000),
      });
    }
  }, [captain?.rides]);

  useEffect(() => {
    if (socket?.id) {
      Console.log("socket id:", socket.id);
    }
  }, [socket?.id]);

  const captainData = captain || {
    fullname: { firstname: "Cargando", lastname: "" },
    _id: null,
    vehicle: { type: "car", capacity: 4, number: "---", color: "Gris" }
  };

  return (
    <div className={`relative w-full h-dvh overflow-hidden bg-[${colors.primary}]`}>
      <Alert
        heading={alert.heading}
        text={alert.text}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        type={alert.type}
      />
      <Sidebar onToggle={handleSidebarToggle} />
      
      {/* Subtle Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#080808] opacity-90" />
      
      {/* Map Container */}
      <div className="absolute inset-0 z-0 rounded-xl overflow-hidden mx-4 my-4 shadow-2xl">
        {/* Glass Overlay for Map */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={glassEffect}></div>
        <MapboxStaticMap
          latitude={mapCenter.lat}
          longitude={mapCenter.lng}
          zoom={mapZoom}
          interactive={true}
          showMarker={true}
          markerColor="#10B981"
          className="w-full h-full"
        />
      </div>

      {/* iOS Deluxe UI Layer */}
      {!isSidebarOpen && !showNewRidePanel && (
        <>
          {/* Top Bar - Captain Profile Floating Island */}
          <motion.div
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            className="absolute top-8 left-6 right-6 z-20 flex items-center justify-between"
          >
            {/* Captain Profile Card - Floating Glass Pill */}
            <Button
              variant="glass"
              size="custom"
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-3 pl-2 pr-5 py-1 rounded-full"
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-[${colors.accent}] to-[${colors.accent}]/70 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10 shadow-lg`}>
                {captainData?.fullname?.firstname?.[0]?.toUpperCase() || 'C'}
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold text-[${colors.textPrimary}]`}>
                  {captainData?.fullname?.firstname || 'Conductor'}
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <p className={`text-xs text-[${colors.textSecondary}]`}>En línea</p>
                </div>
              </div>
            </Button>

            {/* Menu Button - Floating Glass */}
            <Button
              variant="glass"
              size="icon"
              icon={<Menu size={18} />}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir menú"
            />
          </motion.div>

          {/* Map Controls - Floating Glass Card */}
          <motion.div
            variants={fadeInRight}
            initial="initial"
            animate="animate"
            className="absolute right-6 top-24 z-20 flex flex-col gap-3"
          >
            {/* Controls Card */}
            <Card
              variant="glass"
              borderRadius="large"
              className="p-3 flex flex-col gap-3"
            >
              {/* Zoom In */}
              <Button
                variant="glass"
                size="icon"
                onClick={() => setMapZoom(prev => Math.min(prev + 1, 20))}
                icon={<Plus size={18} />}
                aria-label="Acercar mapa"
              />
              
              {/* Zoom Out */}
              <Button
                variant="glass"
                size="icon"
                onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
                icon={<Minus size={18} />}
                aria-label="Alejar mapa"
              />
              
              {/* Recenter */}
              <Button
                variant="glass"
                size="icon"
                onClick={() => {
                  setIsLocating(true);
                  updateLocation();
                  setTimeout(() => setIsLocating(false), 1500);
                }}
                icon={<Target size={18} className={isLocating ? 'animate-spin' : ''} />}
                aria-label="Mi ubicación"
              />
            </Card>
          </motion.div>

          {/* Bottom Stats Dashboard - Floating Glass Island */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="absolute bottom-8 left-6 right-6 z-20"
          >
            <Card
              variant="floating"
              borderRadius="xlarge"
              className="p-6"
            >
              {/* Today's Earnings - Hero Stat */}
              <div className="mb-6 text-center">
                <p className={`text-sm text-[${colors.textSecondary}] mb-1`}>Hoy ganaste</p>
                <p className={`text-5xl font-black text-[${colors.textPrimary}] tracking-tight`}>
                  ${Math.round(earnings.today / 1000)}K
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Total Earnings */}
                <Card variant="glass" borderRadius="large" className="p-3 text-center">
                  <div className={`w-9 h-9 mx-auto mb-2 rounded-full bg-[${colors.accent}]/10 flex items-center justify-center text-[${colors.accent}]`}>
                    <DollarSign size={18} />
                  </div>
                  <p className={`text-xs text-[${colors.textSecondary}] mb-1`}>Total</p>
                  <p className={`text-lg font-bold text-[${colors.textPrimary}]`}>
                    ${Math.round(earnings.total / 1000)}K
                  </p>
                </Card>

                {/* Rides Today */}
                <Card variant="glass" borderRadius="large" className="p-3 text-center">
                  <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Activity size={18} />
                  </div>
                  <p className={`text-xs text-[${colors.textSecondary}] mb-1`}>Viajes</p>
                  <p className={`text-lg font-bold text-[${colors.textPrimary}]`}>
                    {rides.accepted}
                  </p>
                </Card>

                {/* Distance */}
                <Card variant="glass" borderRadius="large" className="p-3 text-center">
                  <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <TrendingUp size={18} />
                  </div>
                  <p className={`text-xs text-[${colors.textSecondary}] mb-1`}>Distancia</p>
                  <p className={`text-lg font-bold text-[${colors.textPrimary}]`}>
                    {rides.distanceTravelled}km
                  </p>
                </Card>
              </div>

              {/* Rating if available */}
              {captain?.rating && (
                <div className={`mt-4 pt-4 border-t border-[${colors.border}] flex items-center justify-center gap-2`}>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className={`text-sm font-semibold text-[${colors.textPrimary}]`}>
                      {captain.rating.average.toFixed(1)}
                    </span>
                  </div>
                  <span className={`text-xs text-[${colors.textSecondary}]`}>
                    ({captain.rating.count} calificaciones)
                  </span>
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}

      {/* New Ride Panel */}
      {!isSidebarOpen && (
        <NewRide
          rideData={newRide}
          otp={otp}
          setOtp={setOtp}
          showBtn={showBtn}
          showPanel={showNewRidePanel}
          setShowPanel={setShowNewRidePanel}
          showPreviousPanel={setShowCaptainDetailsPanel}
          loading={loading}
          acceptRide={acceptRide}
          verifyOTP={verifyOTP}
          endRide={endRide}
          cancelRide={cancelRide}
          error={error}
          unreadMessages={unreadMessages}
        />
      )}

      {/* Ride Completed Modal - iOS Deluxe Style */}
      <AnimatePresence>
        {showRideCompleted && completedRideData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            {/* Glass Card Container */}
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              className="w-full max-w-sm px-2"
            >
              <Card
                variant="floating"
                borderRadius="xlarge"
                className="py-8 px-6"
              >
                {/* Success Icon with Animated Check */}
                <motion.div 
                  className="mx-auto mb-6 flex justify-center"
                  initial={prefersReducedMotion ? {} : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-[${colors.accent}] to-[${colors.accent}]/70 flex items-center justify-center shadow-lg`}>
                    <CheckCircle size={36} strokeWidth={2.5} className="text-white" />
                  </div>
                </motion.div>

                <h2 className={`text-2xl font-bold text-[${colors.textPrimary}] mb-2 text-center`}>
                  ¡Viaje completado!
                </h2>
                <p className={`text-center text-[${colors.textSecondary}] mb-6`}>
                  Has finalizado el viaje exitosamente
                </p>
                
                {/* Earnings Display - Glass Card */}
                <Card
                  variant="glass"
                  borderRadius="large"
                  className="p-5 mb-6"
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className={`w-10 h-10 rounded-full bg-[${colors.accent}]/10 flex items-center justify-center text-[${colors.accent}]`}>
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <p className={`text-sm text-[${colors.textSecondary}] text-center mb-1`}>
                    Ganancia del viaje
                  </p>
                  <p className={`text-4xl font-black text-center text-[${colors.accent}]`}>
                    ${completedRideData.fare?.toLocaleString('es-CO') || 0}
                  </p>
                </Card>
                
                {/* Distance Badge */}
                <div className="flex justify-center mb-8">
                  <Badge variant="glass">
                    <div className="flex items-center gap-1.5 px-2 py-1">
                      <MapPinned size={14} className={`text-[${colors.textSecondary}]`} />
                      <span className={`text-sm text-[${colors.textSecondary}]`}>
                        {Math.round((completedRideData.distance || 0) / 1000)} km
                      </span>
                    </div>
                  </Badge>
                </div>
                
                {/* Continue Button */}
                <Button
                  variant="primary"
                  size="large"
                  title="Continuar"
                  onClick={closeRideCompleted}
                  fullWidth
                />
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Message Notification Banner */}
      <MessageNotificationBanner
        senderName={lastMessage.sender}
        message={lastMessage.text}
        show={showMessageBanner}
        onClose={() => setShowMessageBanner(false)}
        onTap={() => {
          setShowMessageBanner(false);
          setUnreadMessages(0);
          navigate(`/captain/chat/${newRide?._id}`);
        }}
      />
    </div>
  );
}

export default CaptainHomeScreen;