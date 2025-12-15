import { useCallback, useContext, useEffect, useRef, useState, useMemo } from "react";
import { useUser } from "../contexts/UserContext";
import {
  LocationSuggestions,
  SelectVehicle,
  RideDetails,
  Sidebar,
} from "../components";
import EliteTrackingMap from "../components/maps/EliteTrackingMap";
import MapboxStaticMap from "../components/maps/MapboxStaticMap";
import MessageNotificationBanner from "../components/ui/MessageNotificationBanner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import debounce from "lodash.debounce";
import { SocketDataContext } from "../contexts/SocketContext";
import Console from "../utils/console";
import { 
  Navigation, 
  MapPin, 
  Search, 
  X, 
  Plus,
  Minus,
  Compass,
  Menu,
  Loader2,
  ChevronRight,
  MessageSquare,
  User as UserIcon,
  Clock,
  MapPinned,
  Shield,
  Target,
  Home,
  Briefcase,
  Star,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LocationFavoritesPills from "../components/LocationFavoritesPills";
import SaveLocationModal from "../components/SaveLocationModal";

// Import design system components
import { colors, shadows, glassEffect, borderRadius } from "../styles/designSystem";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Badge from "../components/common/Badge";

// Coordenadas de San Antonio del Táchira, Colombia (frontera)
const DEFAULT_LOCATION = {
  lat: 7.8146,
  lng: -72.4430
};

// URLs de sonidos de notificación
const NOTIFICATION_SOUNDS = {
  rideConfirmed: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  rideStarted: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  rideEnded: "https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3",
  newMessage: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"
};

// Función para reproducir sonido
const playSound = (soundUrl) => {
  try {
    const audio = new Audio(soundUrl);
    audio.volume = 0.5;
    audio.play().catch(e => Console.log("Error reproduciendo sonido:", e));
  } catch (e) {
    Console.log("Error con audio:", e);
  }
};

// Función para vibrar
const vibrate = (pattern = [200, 100, 200]) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

function UserHomeScreen() {
  const token = localStorage.getItem("token");
  const { socket } = useContext(SocketDataContext);
  const { user } = useUser();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showMessageBanner, setShowMessageBanner] = useState(false);
  const [lastMessage, setLastMessage] = useState({ sender: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [selectedInput, setSelectedInput] = useState("pickup");
  const [locationSuggestion, setLocationSuggestion] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng
  });
  const [rideCreated, setRideCreated] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [currentRideStatus, setCurrentRideStatus] = useState("pending");

  // Estado para ubicaciones favoritas
  const [showSaveLocationModal, setShowSaveLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);

  // Detalles del viaje
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [fare, setFare] = useState({
    car: 0,
    bike: 0,
  });
  const [confirmedRideData, setConfirmedRideData] = useState(null);
  const [rideETA, setRideETA] = useState(null);
  const rideTimeout = useRef(null);

  // UI State - iOS Deluxe Floating Island
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showSelectVehiclePanel, setShowSelectVehiclePanel] = useState(false);
  const [showRideDetailsPanel, setShowRideDetailsPanel] = useState(false);
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

  // Handle sidebar toggle
  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
  };

  // Obtener ubicación actual y convertirla a dirección
  const getCurrentLocation = async () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await axios.get(
              `${import.meta.env.VITE_SERVER_URL}/map/get-address?lat=${latitude}&lng=${longitude}`,
              {
                headers: { token: token },
              }
            );
            if (response.data && response.data.address) {
              setPickupLocation(response.data.address);
            } else {
              setPickupLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
          } catch (error) {
            Console.error("Error obteniendo dirección:", error);
            setPickupLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          }
          setGettingLocation(false);
        },
        (error) => {
          Console.error("Error obteniendo ubicación:", error);
          setGettingLocation(false);
          alert("No se pudo obtener tu ubicación actual. Verifica los permisos de ubicación.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setGettingLocation(false);
      alert("Tu navegador no soporta geolocalización.");
    }
  };

  // AbortController ref for canceling stale requests
  const abortControllerRef = useRef(null);

  // Memoize debounced function with AbortController
  // MEDIUM-010: Store debounced function ref for cleanup
  const handleLocationChange = useMemo(
    () => debounce(async (inputValue, token) => {
      if (inputValue.length >= 3) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsSearchingLocation(true);

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/map/get-suggestions?input=${inputValue}`,
            {
              headers: {
                token: token,
              },
              signal: abortControllerRef.current.signal,
              withCredentials: true, // CRITICAL-006: Send cookies
            }
          );
          Console.log(response.data);
          setLocationSuggestion(response.data);
        } catch (error) {
          if (error.name !== 'CanceledError') {
            Console.error(error);
          }
        } finally {
          setIsSearchingLocation(false);
        }
      } else {
        setIsSearchingLocation(false);
      }
    }, 300),
    []
  );
  
  // MEDIUM-010: Cleanup debounce and abort controller on unmount
  useEffect(() => {
    return () => {
      handleLocationChange.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [handleLocationChange]);

  const onChangeHandler = (e) => {
    setSelectedInput(e.target.id);
    const value = e.target.value;
    if (e.target.id === "pickup") {
      setPickupLocation(value);
    } else if (e.target.id === "destination") {
      setDestinationLocation(value);
    }

    if (import.meta.env.VITE_ENVIRONMENT === "production") {
      handleLocationChange(value, token);
    }

    if (e.target.value.length < 3) {
      setLocationSuggestion([]);
    }
  };

  const getDistanceAndFare = async (pickupLocation, destinationLocation) => {
    Console.log(pickupLocation, destinationLocation);
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/get-fare?pickup=${encodeURIComponent(pickupLocation)}&destination=${encodeURIComponent(destinationLocation)}`,
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log(response);
      setFare(response.data.fare);
      
      if (response.data.pickupCoordinates) {
        setPickupCoordinates(response.data.pickupCoordinates);
      }
      if (response.data.destinationCoordinates) {
        setDestinationCoordinates(response.data.destinationCoordinates);
      }

      setShowSearchPanel(false);
      setShowSelectVehiclePanel(true);
      setLocationSuggestion([]);
      setLoading(false);
    } catch (error) {
      Console.log(error);
      setLoading(false);
    }
  };

  const createRide = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ride/create`,
        {
          pickup: pickupLocation,
          destination: destinationLocation,
          vehicleType: selectedVehicle,
          paymentMethod: selectedPaymentMethod,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log(response);
      const rideData = {
        pickup: pickupLocation,
        destination: destinationLocation,
        vehicleType: selectedVehicle,
        paymentMethod: selectedPaymentMethod,
        fare: fare,
        confirmedRideData: confirmedRideData,
        _id: response.data._id,
      };
      localStorage.setItem("rideDetails", JSON.stringify(rideData));
      setLoading(false);
      setRideCreated(true);

      rideTimeout.current = setTimeout(() => {
        cancelRide();
      }, import.meta.env.VITE_RIDE_TIMEOUT);
      
    } catch (error) {
      Console.log(error);
      setLoading(false);
    }
  };

  const cancelRide = async () => {
    try {
      const rideDetails = JSON.parse(localStorage.getItem("rideDetails") || "{}");
      
      if (!rideDetails._id && !rideDetails.confirmedRideData?._id) {
        Console.error("No ride ID found in localStorage");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/cancel?rideId=${rideDetails._id || rideDetails.confirmedRideData?._id}`,
        {
          headers: {
            token: token,
          },
        }
      );
      setLoading(false);
      updateLocation();
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowSearchPanel(false);
      setDefaults();
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      localStorage.removeItem("messages");
      localStorage.removeItem("showPanel");
      localStorage.removeItem("showBtn");
    } catch (error) {
      Console.error("Error cancelling ride:", error);
      setLoading(false);
    }
  };

  const setDefaults = () => {
    setPickupLocation("");
    setDestinationLocation("");
    setSelectedVehicle("car");
    setSelectedPaymentMethod("cash");
    setFare({
      car: 0,
      bike: 0,
    });
    setConfirmedRideData(null);
    setRideCreated(false);
  };

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
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
    } else {
      setMapCenter({
        lat: DEFAULT_LOCATION.lat,
        lng: DEFAULT_LOCATION.lng
      });
    }
  };

  useEffect(() => {
    updateLocation();
  }, []);

  // Socket events
  useEffect(() => {
    if (!user._id || !socket) {
      return;
    }

    socket.emit("join", {
      userId: user._id,
      userType: "user",
    });

    const handleRideConfirmed = (data) => {
      Console.log("Limpiando Timeout", rideTimeout);
      clearTimeout(rideTimeout.current);
      Console.log("Timeout limpiado");
      Console.log("Viaje Confirmado");
      Console.log(data.captain.location);
      
      vibrate([200, 100, 200, 100, 200]);
      playSound(NOTIFICATION_SOUNDS.rideConfirmed);
      
      if (data.captain.location && data.captain.location.coordinates) {
        setDriverLocation({
          lng: data.captain.location.coordinates[0],
          lat: data.captain.location.coordinates[1]
        });
      }
      
      if (data.pickupCoordinates) {
        setPickupCoordinates(data.pickupCoordinates);
      }
      if (data.destinationCoordinates) {
        setDestinationCoordinates(data.destinationCoordinates);
      }
      
      setCurrentRideStatus("accepted");
      if (data.captain?.location?.coordinates) {
        setMapCenter({
          lat: data.captain.location.coordinates[1],
          lng: data.captain.location.coordinates[0]
        });
      }
      setConfirmedRideData(data);
    };

    const handleRideStarted = () => {
      Console.log("Viaje iniciado");
      playSound(NOTIFICATION_SOUNDS.rideStarted);
      vibrate([300, 100, 300]);
      setCurrentRideStatus("ongoing");
    };

    const handleDriverLocationUpdated = (data) => {
      Console.log("Ubicación del conductor actualizada:", data);
      if (data.location) {
        setDriverLocation({
          lng: data.location.lng,
          lat: data.location.lat
        });
      }
    };

    const handleRideEnded = () => {
      Console.log("Viaje Finalizado");
      playSound(NOTIFICATION_SOUNDS.rideEnded);
      vibrate([500]);
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowSearchPanel(false);
      setDefaults();
      setDriverLocation(null);
      setCurrentRideStatus("pending");
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude
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

    socket.on("ride-confirmed", handleRideConfirmed);
    socket.on("ride-started", handleRideStarted);
    socket.on("driver:locationUpdated", handleDriverLocationUpdated);
    socket.on("ride-ended", handleRideEnded);

    return () => {
      socket.off("ride-confirmed", handleRideConfirmed);
      socket.off("ride-started", handleRideStarted);
      socket.off("ride-ended", handleRideEnded);
      socket.off("driver:locationUpdated", handleDriverLocationUpdated);
    };
  }, [user._id, socket]);

  // Restore ride details from localStorage
  useEffect(() => {
    const storedRideDetails = localStorage.getItem("rideDetails");
    const storedPanelDetails = localStorage.getItem("panelDetails");

    if (storedRideDetails) {
      const ride = JSON.parse(storedRideDetails);
      setPickupLocation(ride.pickup);
      setDestinationLocation(ride.destination);
      setSelectedVehicle(ride.vehicleType);
      setSelectedPaymentMethod(ride.paymentMethod);
      setFare(ride.fare);
      setConfirmedRideData(ride.confirmedRideData);
    }

    if (storedPanelDetails) {
      const panels = JSON.parse(storedPanelDetails);
      setShowSearchPanel(panels.showFindTripPanel || false);
      setShowSelectVehiclePanel(panels.showSelectVehiclePanel || false);
      setShowRideDetailsPanel(panels.showRideDetailsPanel || false);
    }
  }, []);

  // Debounced localStorage saves
  const saveRideDetailsDebounced = useMemo(
    () => debounce((rideData) => {
      localStorage.setItem("rideDetails", JSON.stringify(rideData));
    }, 500),
    []
  );

  const savePanelDetailsDebounced = useMemo(
    () => debounce((panelDetails) => {
      localStorage.setItem("panelDetails", JSON.stringify(panelDetails));
    }, 500),
    []
  );

  const saveMessagesDebounced = useMemo(
    () => debounce((messages) => {
      localStorage.setItem("messages", JSON.stringify(messages));
    }, 1000),
    []
  );

  useEffect(() => {
    const rideData = {
      pickup: pickupLocation,
      destination: destinationLocation,
      vehicleType: selectedVehicle,
      paymentMethod: selectedPaymentMethod,
      fare: fare,
      confirmedRideData: confirmedRideData,
    };
    saveRideDetailsDebounced(rideData);
  }, [
    pickupLocation,
    destinationLocation,
    selectedVehicle,
    selectedPaymentMethod,
    fare,
    confirmedRideData,
    saveRideDetailsDebounced,
  ]);

  useEffect(() => {
    const panelDetails = {
      showFindTripPanel: showSearchPanel,
      showSelectVehiclePanel,
      showRideDetailsPanel,
    };
    savePanelDetailsDebounced(panelDetails);
  }, [showSearchPanel, showSelectVehiclePanel, showRideDetailsPanel, savePanelDetailsDebounced]);

  useEffect(() => {
    saveMessagesDebounced(messages);
  }, [messages, saveMessagesDebounced]);

  useEffect(() => {
    if (!confirmedRideData?._id) return;
    
    socket.emit("join-room", confirmedRideData._id);

    const handleReceiveMessage = (data) => {
      const messageText = typeof data === 'string' ? data : (data?.msg || '');
      const messageBy = typeof data === 'string' ? 'other' : (data?.by || 'other');
      const messageTime = typeof data === 'string' ? '' : (data?.time || '');
      
      setMessages((prev) => [...prev, { msg: messageText, by: messageBy, time: messageTime }]);
      setUnreadMessages((prev) => prev + 1);
      
      setLastMessage({
        sender: confirmedRideData?.captain?.fullname?.firstname || "Conductor",
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
  }, [confirmedRideData?._id, socket]);

  const handleETAUpdate = (data) => {
    setRideETA(data);
    Console.log("ETA actualizado:", data);
  };

  const showEliteMap = confirmedRideData && driverLocation;

  const handleLocationSuggestion = (suggestion) => {
    if (selectedInput === "pickup") {
      setPickupLocation(suggestion.address);
      setPickupCoordinates({
        lat: suggestion.coordinates.lat,
        lng: suggestion.coordinates.lng,
      });
    } else if (selectedInput === "destination") {
      setDestinationLocation(suggestion.address);
      setDestinationCoordinates({
        lat: suggestion.coordinates.lat,
        lng: suggestion.coordinates.lng,
      });
    }
    setLocationSuggestion([]);
    
    // Mostrar opción para guardar como favorito después de seleccionar ubicación
    if (suggestion.showSaveOption) {
      setSelectedLocation({
        address: suggestion.address,
        coordinates: suggestion.coordinates
      });
    }
  };

  // Manejar selección de ubicación favorita
  const handleSelectSavedLocation = (location) => {
    if (selectedInput === "pickup" || (!pickupLocation && !destinationLocation)) {
      setPickupLocation(location.address);
      setPickupCoordinates(location.coordinates);
    } else if (selectedInput === "destination") {
      setDestinationLocation(location.address);
      setDestinationCoordinates(location.coordinates);
    } else {
      // Si ambos campos están llenos, preguntar cuál quiere llenar
      const replacePickup = window.confirm(
        "¿Deseas reemplazar la ubicación de origen? Presiona Cancelar para reemplazar el destino."
      );
      
      if (replacePickup) {
        setPickupLocation(location.address);
        setPickupCoordinates(location.coordinates);
      } else {
        setDestinationLocation(location.address);
        setDestinationCoordinates(location.coordinates);
      }
    }
  };

  // Abrir modal para agregar favorito
  const handleAddFavorite = () => {
    setEditingLocation(null);
    setShowSaveLocationModal(true);
  };

  // Abrir modal para editar favorito existente
  const handleEditFavorite = (location) => {
    setEditingLocation(location);
    setShowSaveLocationModal(true);
  };

  // Guardar ubicación favorita
  const handleSaveLocation = async (locationData, locationId) => {
    try {
      if (locationId) {
        // Actualizar ubicación existente
        await axios.put(
          `${import.meta.env.VITE_SERVER_URL}/user/saved-locations/${locationId}`,
          locationData,
          { headers: { token } }
        );
      } else {
        // Crear nueva ubicación
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/user/saved-locations`,
          locationData,
          { headers: { token } }
        );
      }
      
      // Mostrar mensaje de éxito
      alert(locationId ? "Ubicación actualizada" : "Ubicación guardada exitosamente");
      
    } catch (error) {
      console.error("Error guardando ubicación:", error);
      alert(
        error.response?.data?.message || 
        "Ocurrió un error al guardar la ubicación"
      );
    }
  };

  return (
    <div className={`relative w-full h-dvh overflow-hidden bg-[${colors.primary}]`}>
      <Sidebar onToggle={handleSidebarToggle} />
      
      {/* Subtle Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#080808] opacity-90" />
      
      {/* Map Container */}
      <div className="absolute inset-0 z-0 rounded-xl overflow-hidden mx-4 my-4 shadow-2xl">
        {/* Glass Overlay for Map */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={glassEffect}></div>
        {showEliteMap ? (
          <EliteTrackingMap
            driverLocation={driverLocation}
            pickupLocation={pickupCoordinates}
            dropoffLocation={currentRideStatus === "ongoing" ? destinationCoordinates : null}
            rideId={confirmedRideData._id}
            rideStatus={currentRideStatus}
            userType="user"
            vehicleType={selectedVehicle}
            onETAUpdate={handleETAUpdate}
            className="w-full h-full"
          />
        ) : (
          <MapboxStaticMap
            latitude={mapCenter.lat}
            longitude={mapCenter.lng}
            zoom={mapZoom}
            interactive={true}
            showMarker={true}
            markerColor="#10B981"
            className="w-full h-full"
          />
        )}
      </div>

      {/* iOS Deluxe UI Layer */}
      {!isSidebarOpen && !showSelectVehiclePanel && !showRideDetailsPanel && !rideCreated && (
        <>
          {/* Top Bar - User Profile Floating Island */}
          <motion.div
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            className="absolute top-8 left-6 right-6 z-20 flex items-center justify-between"
          >
            {/* User Profile Card - Floating Glass Pill */}
            <Button
              variant="glass"
              size="custom"
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-3 pl-2 pr-5 py-1 rounded-full"
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-[${colors.accent}] to-[${colors.accent}]/70 flex items-center justify-center flex-shrink-0 text-[${colors.accent}]`}>
                {user?.fullname?.firstname?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold text-[${colors.textPrimary}]`}>
                  {user?.fullname?.firstname || 'Usuario'}
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
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

          {/* Bottom Search Card - Floating Glass Island */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="absolute bottom-8 left-6 right-6 z-20"
          >
            <Card
              variant="floating"
              borderRadius="xlarge"
              className="overflow-hidden"
            >
              <Button
                variant="custom"
                size="custom"
                onClick={() => setShowSearchPanel(true)}
                className="w-full p-6 flex items-center gap-4 bg-transparent"
              >
                <div className={`w-12 h-12 rounded-full bg-[${colors.accent}]/10 flex items-center justify-center flex-shrink-0 text-[${colors.accent}]`}>
                  <Search size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className={`text-lg font-semibold text-[${colors.textPrimary}]`}>
                    ¿A dónde vamos?
                  </p>
                  <p className={`text-sm text-[${colors.textSecondary}]`}>
                    Toca para buscar destino
                  </p>
                </div>
              </Button>
              
              {/* Ubicaciones Favoritas */}
              <div className="px-1 py-2">
                <LocationFavoritesPills
                  onSelectLocation={handleSelectSavedLocation}
                  onAddFavorite={handleAddFavorite}
                  onEditFavorite={handleEditFavorite}
                />
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {/* Search Panel - Bottom Sheet */}
      <AnimatePresence>
        {showSearchPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearchPanel(false)}
              className="absolute inset-0 bg-black/50 z-30"
            />

            {/* Panel */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 z-40 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-6"></div>

              {/* Close Button */}
              <button
                onClick={() => setShowSearchPanel(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              >
                <X size={20} className="text-gray-900 dark:text-white" />
              </button>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  Planear viaje
                </h2>

                {/* Route Inputs */}
                <div className="relative mb-6">
                  {/* Connector Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-between z-0">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
                    <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 border-2 border-white dark:border-gray-900" />
                  </div>

                  {/* Pickup Input */}
                  <div className="relative mb-4 pl-12">
                    <input
                      id="pickup"
                      placeholder="Punto de recogida"
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-500 px-4 pr-12 py-4 rounded-2xl outline-none text-base transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                      value={pickupLocation}
                      onChange={onChangeHandler}
                      autoComplete="off"
                    />
                    <button
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all active:scale-90"
                      title="Usar ubicación actual"
                    >
                      {gettingLocation ? (
                        <Loader2 size={18} className="animate-spin text-white" />
                      ) : (
                        <Navigation size={18} className="text-white" />
                      )}
                    </button>
                  </div>

                  {/* Destination Input */}
                  <div className="relative pl-12">
                    <input
                      id="destination"
                      placeholder="Destino"
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500 px-4 py-4 rounded-2xl outline-none text-base transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                      value={destinationLocation}
                      onChange={onChangeHandler}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Search Button */}
                {pickupLocation.length > 2 && destinationLocation.length > 2 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => getDistanceAndFare(pickupLocation, destinationLocation)}
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-2xl shadow-lg transition-all disabled:opacity-50 mb-6"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        <span>Buscando...</span>
                      </div>
                    ) : (
                      'Buscar viaje'
                    )}
                  </motion.button>
                )}

                {/* Location Suggestions */}
                {isSearchingLocation && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-emerald-500" />
                  </div>
                )}

                {locationSuggestion.length > 0 && !isSearchingLocation && (
                  <div className="space-y-2">
                    <LocationSuggestions
                      suggestions={locationSuggestion}
                      setSuggestions={setLocationSuggestion}
                      setPickupLocation={setPickupLocation}
                      setDestinationLocation={setDestinationLocation}
                      input={selectedInput}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Vehicle Selection & Ride Details - Keep existing components but render conditionally */}
      {!isSidebarOpen && (
        <>
          <SelectVehicle
            selectedVehicle={setSelectedVehicle}
            showPanel={showSelectVehiclePanel}
            setShowPanel={setShowSelectVehiclePanel}
            showPreviousPanel={setShowSearchPanel}
            showNextPanel={setShowRideDetailsPanel}
            fare={fare}
            paymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={setSelectedPaymentMethod}
          />

          <RideDetails
            pickupLocation={pickupLocation}
            destinationLocation={destinationLocation}
            selectedVehicle={selectedVehicle}
            paymentMethod={selectedPaymentMethod}
            fare={fare}
            showPanel={showRideDetailsPanel}
            setShowPanel={setShowRideDetailsPanel}
            showPreviousPanel={setShowSelectVehiclePanel}
            createRide={createRide}
            cancelRide={cancelRide}
            loading={loading}
            rideCreated={rideCreated}
            confirmedRideData={confirmedRideData}
            unreadMessages={unreadMessages}
          />
        </>
      )}

      {/* Looking for Driver Overlay - iOS Deluxe Style */}
      <AnimatePresence>
        {rideCreated && !confirmedRideData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center"
          >
            {/* Glass Card Container */}
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              className="w-full max-w-xs px-8"
            >
              <Card
                variant="floating"
                borderRadius="xlarge"
                className="py-8 px-6"
              >
                {/* Animated Pulsing Pin */}
                <motion.div 
                  className="mx-auto mb-6 flex justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-[${colors.accent}] to-[${colors.accent}]/70 flex items-center justify-center relative`}>
                    {/* Inner pulse rings */}
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-white/20"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
                    />
                    <MapPinned size={36} className="text-white" strokeWidth={2.5} />
                  </div>
                </motion.div>

                <h2 className={`text-2xl font-bold text-[${colors.textPrimary}] mb-2 text-center`}>
                  Buscando conductor
                </h2>
                <p className={`text-[${colors.textSecondary}] mb-8 text-center`}>
                  Conectando con conductores cercanos...
                </p>

                {/* Cancel Button */}
                <Button
                  variant="glass"
                  size="large"
                  title={loading ? "Cancelando..." : "Cancelar búsqueda"}
                  onClick={cancelRide}
                  disabled={loading}
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
          navigate(`/user/chat/${confirmedRideData?._id}`);
        }}
      />
    </div>
  );
}

export default UserHomeScreen;