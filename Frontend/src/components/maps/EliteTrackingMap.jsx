import { useEffect, useRef, useState, useContext, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { SocketDataContext } from "../../contexts/SocketContext";
import { cn } from "../../utils/cn";
import { calculateDistance, calculateETA, formatDistance, formatDuration } from "../../utils/rideTracking";
import { colors, shadows, glassEffect, borderRadius } from "../../styles/designSystem";
import { motion, AnimatePresence } from "framer-motion";

// Set Mapbox access token
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
if (!mapboxToken) {
  console.warn("⚠️ VITE_MAPBOX_TOKEN not found in environment variables");
}
mapboxgl.accessToken = mapboxToken || "";

// Premium CDN marker icons (high-quality 3D assets)
const PREMIUM_ICONS = {
  car: "https://cdn-icons-png.flaticon.com/512/3097/3097152.png", // Premium 3D car icon
  bike: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png", // Premium 3D motorcycle icon
  carAlt: "https://img.icons8.com/3d-fluency/512/car--v1.png", // Alternative 3D car
  bikeAlt: "https://img.icons8.com/3d-fluency/512/motorbike.png", // Alternative 3D bike
};

// 🎯 Configuration constants for maintainability
const CONFIG = {
  INITIAL_ROUTE_UPDATE_INTERVAL: 30000, // 30 seconds for first 5 updates
  STANDARD_ROUTE_UPDATE_INTERVAL: 60000, // 60 seconds thereafter
  LOCATION_TIMEOUT_THRESHOLD: 30000, // 30 seconds before GPS timeout
  INTERPOLATION_DURATION: 2000, // 2 seconds for smooth marker movement
  MAP_FIT_BOUNDS_PADDING: 50, // 50px padding (enterprise requirement)
  MAP_FIT_BOUNDS_DURATION: 1500, // 1.5 seconds transition
  ROUTE_RECALC_THRESHOLD: 5, // Number of fast updates before slowing down
};

/**
 * ⭐ ELITE WORLD-CLASS REAL-TIME TRACKING MAP COMPONENT ⭐
 * 
 * Enterprise-Level ($100k+) Real-Time Tracking System
 * Implements UBER/Lyft-level premium tracking experience
 * 
 * 🎯 DUAL-PHASE TRACKING SYSTEM:
 * 
 * PHASE 1 - PRE-PICKUP (Driver Acceptance → OTP Validation):
 *   - Shows: Driver icon + User icon
 *   - Route: Driver current location → User pickup location
 *   - Updates: Real-time driver position with smooth interpolation
 *   - Trigger: When ride status is "accepted" or "pending"
 * 
 * PHASE 2 - IN-PROGRESS (Post-OTP → Destination):
 *   - Clears: Previous route immediately
 *   - Route: Current location → Final destination
 *   - Updates: Continuous tracking with auto-fit bounds
 *   - Trigger: When ride status changes to "ongoing"
 * 
 * 🚀 PREMIUM FEATURES:
 *   - Smooth linear interpolation (no marker "jumping")
 *   - Bearing-based rotation (vehicle points forward)
 *   - Premium 3D icons from CDN (high-quality assets)
 *   - Intelligent auto-fit bounds (50px padding)
 *   - Zero-bug error handling (null/undefined guards)
 *   - Optimized Socket.io (no unnecessary re-renders)
 * 
 * @param {Object} props.driverLocation - {lat, lng} Driver's current GPS position
 * @param {Object} props.pickupLocation - {lat, lng} User pickup coordinates
 * @param {Object} props.dropoffLocation - {lat, lng} Final destination coordinates
 * @param {string} props.rideId - Unique ride identifier
 * @param {string} props.rideStatus - "pending" | "accepted" | "ongoing" | "completed"
 * @param {string} props.userType - "user" | "captain" (determines camera behavior)
 * @param {string} props.vehicleType - "car" | "bike" (selects icon)
 * @param {Function} props.onETAUpdate - Callback for ETA updates: ({eta, distance}) => void
 * @param {string} props.className - Additional Tailwind classes
 */
function EliteTrackingMap({
  driverLocation,
  pickupLocation,
  dropoffLocation,
  rideId,
  rideStatus = "accepted",
  userType = "user",
  vehicleType = "car",
  onETAUpdate,
  className,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const driverMarker = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);
  const routeLayer = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const { socket } = useContext(SocketDataContext);
  const lastDriverLocation = useRef(null);
  const updateInterval = useRef(null);
  
  // 🎯 Enhanced tracking states for enterprise-level reliability
  const [trackingError, setTrackingError] = useState(null);
  const [locationTimeout, setLocationTimeout] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(Date.now());
  const locationTimeoutRef = useRef(null);
  const routeRecalculationCount = useRef(0);
  const previousPhaseRef = useRef(null); // Track phase changes for route clearing
  const animationFrameRef = useRef(null); // For smooth interpolation
  const targetLocationRef = useRef(null); // Target position for interpolation

  // Determine vehicle icon (premium 3D assets)
  const vehicleIcon = vehicleType === "bike" ? PREMIUM_ICONS.bike : PREMIUM_ICONS.car;
  
  // Determine tracking phase (critical for dual-phase logic)
  const isPrePickup = rideStatus === "pending" || rideStatus === "accepted";
  const isInProgress = rideStatus === "ongoing";
  const currentPhase = isPrePickup ? "PRE_PICKUP" : isInProgress ? "IN_PROGRESS" : "IDLE";

  /**
   * 🎯 Calculate bearing between two points for vehicle rotation
   * Returns angle in degrees (0-360) for CSS transform rotation
   */
  const calculateBearing = useCallback((lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
    
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }, []);

  /**
   * 🎯 Smooth linear interpolation for marker movement
   * Prevents "jumping" by animating between GPS updates
   */
  const interpolatePosition = useCallback((start, end, progress) => {
    if (!start || !end) return end;
    return {
      lat: start.lat + (end.lat - start.lat) * progress,
      lng: start.lng + (end.lng - start.lng) * progress,
    };
  }, []);

  /**
   * 🎯 Validate coordinates to prevent crashes
   * Returns true if coordinates are valid GPS values
   */
  const validateCoordinates = useCallback((coords) => {
    if (!coords) return false;
    const { lat, lng } = coords;
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !isNaN(lat) && !isNaN(lng)
    );
  }, []);

  // Initialize map with enhanced error handling
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    // 🛡️ Validate initial coordinates to prevent white screen
    let initialCenter = [-72.4430, 7.8146]; // Default: San Antonio del Táchira
    
    if (validateCoordinates(driverLocation)) {
      initialCenter = [driverLocation.lng, driverLocation.lat];
    } else if (validateCoordinates(pickupLocation)) {
      initialCenter = [pickupLocation.lng, pickupLocation.lat];
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: initialCenter,
        zoom: 14,
        pitch: 0,
        bearing: 0,
        preserveDrawingBuffer: true,
      });

      map.current.on('load', () => {
        setIsMapLoaded(true);
        
        // Add route source (empty initially)
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });

        // Add route layer with premium styling
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#4A90E2', // UBER blue
            'line-width': 5,
            'line-opacity': 0.7
          }
        });
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error);
        setTrackingError('MAP_ERROR');
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    } catch (error) {
      console.error('Failed to initialize Mapbox map:', error);
      setTrackingError('MAP_INIT_ERROR');
    }

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      map.current?.remove();
    };
  }, [validateCoordinates]);

  // 🎨 Create iOS Deluxe driver marker with high-quality 3D icon
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    if (!validateCoordinates(driverLocation)) return;

    if (driverMarker.current) {
      driverMarker.current.remove();
    }

    // Create iOS Deluxe marker element with premium styling
    const el = document.createElement('div');
    el.className = 'ios-deluxe-driver-marker';
    el.style.cssText = `
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      will-change: transform;
      position: relative;
    `;
    
    // Outer blur halo (glassmorphism effect)
    const blurHalo = document.createElement('div');
    blurHalo.style.cssText = `
      position: absolute;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      backdrop-filter: blur(8px);
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: ${shadows.floating};
      z-index: 1;
    `;
    
    // Premium icon container with glassmorphism
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.8);
      box-shadow: ${shadows.medium};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      z-index: 2;
    `;
    
    // Accent color ring around icon
    const accentRing = document.createElement('div');
    accentRing.style.cssText = `
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 2px solid ${colors.accent};
      opacity: 0.7;
      z-index: 1;
    `;
    iconContainer.appendChild(accentRing);
    
    // High-quality CDN icon
    const icon = document.createElement('img');
    icon.src = vehicleIcon;
    icon.alt = vehicleType === 'bike' ? 'Moto' : 'Carro';
    icon.style.cssText = `
      width: 28px;
      height: 28px;
      object-fit: contain;
      user-select: none;
      pointer-events: none;
      z-index: 3;
      position: relative;
    `;
    
    // Fallback in case CDN icon fails to load
    icon.onerror = () => {
      icon.style.display = 'none';
      const fallbackEmoji = document.createElement('span');
      fallbackEmoji.textContent = vehicleType === 'bike' ? '🛵' : '🚗';
      fallbackEmoji.style.cssText = 'font-size: 24px; z-index: 3;';
      iconContainer.appendChild(fallbackEmoji);
    };
    
    // Pulse animation for location accuracy
    const pulseRing = document.createElement('div');
    pulseRing.style.cssText = `
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      background: ${colors.accent}20;
      z-index: 0;
    `;
    
    // Append elements in proper order
    el.appendChild(pulseRing);
    el.appendChild(blurHalo);
    iconContainer.appendChild(icon);
    el.appendChild(iconContainer);

    // iOS Deluxe animations
    const style = document.createElement('style');
    if (!document.getElementById('ios-deluxe-marker-styles')) {
      style.id = 'ios-deluxe-marker-styles';
      style.textContent = `
        @keyframes ios-deluxe-pulse {
          0% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        .ios-deluxe-driver-marker > div:first-child {
          animation: ios-deluxe-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .ios-deluxe-driver-marker:hover > div:nth-child(3) {
          transform: scale(1.08);
          box-shadow: ${shadows.large};
        }
      `;
      document.head.appendChild(style);
    }

    driverMarker.current = new mapboxgl.Marker({
      element: el,
      anchor: 'center',
      rotationAlignment: 'map', // Allow rotation
      pitchAlignment: 'map',
    })
      .setLngLat([driverLocation.lng, driverLocation.lat])
      .addTo(map.current);

    lastDriverLocation.current = driverLocation;

    return () => {
      if (driverMarker.current) {
        driverMarker.current.remove();
      }
    };
  }, [isMapLoaded, vehicleIcon, vehicleType, validateCoordinates]);

  // 🚀 Update driver location with SMOOTH INTERPOLATION and BEARING ROTATION
  useEffect(() => {
    if (!driverMarker.current) return;
    if (!validateCoordinates(driverLocation)) return;
    if (!lastDriverLocation.current) {
      lastDriverLocation.current = driverLocation;
      return;
    }

    const oldLocation = lastDriverLocation.current;
    const newLocation = driverLocation;

    // Skip update if location hasn't changed
    if (oldLocation.lat === newLocation.lat && oldLocation.lng === newLocation.lng) {
      return;
    }

    // 🎯 Calculate bearing for vehicle rotation (nose points forward)
    const bearing = calculateBearing(
      oldLocation.lat,
      oldLocation.lng,
      newLocation.lat,
      newLocation.lng
    );

    // 🎯 Smooth interpolation animation (60 FPS, configurable duration)
    const duration = CONFIG.INTERPOLATION_DURATION;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out curve for natural deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate position
      const interpolated = interpolatePosition(oldLocation, newLocation, easeProgress);
      
      if (driverMarker.current && validateCoordinates(interpolated)) {
        // Update marker position
        driverMarker.current.setLngLat([interpolated.lng, interpolated.lat]);
        
        // Apply rotation to marker element
        const el = driverMarker.current.getElement();
        if (el) {
          // Smooth rotation transition
          el.style.transform = `rotate(${bearing}deg)`;
          el.style.transition = 'transform 0.3s ease-out';
        }
        
        // Center map smoothly on driver (only for passengers)
        if (map.current && userType === "user" && progress < 1) {
          map.current.easeTo({
            center: [interpolated.lng, interpolated.lat],
            duration: 100,
            essential: true,
          });
        }
      }
      
      // Continue animation until complete
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        lastDriverLocation.current = newLocation;
      }
    };
    
    // Cancel previous animation if running
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Start animation
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [driverLocation, userType, calculateBearing, interpolatePosition, validateCoordinates]);

  // Create pickup marker with iOS Deluxe styling
  useEffect(() => {
    if (!map.current || !isMapLoaded || !pickupLocation) return;

    if (pickupMarker.current) {
      pickupMarker.current.remove();
    }

    // Create container element
    const el = document.createElement('div');
    el.className = 'ios-deluxe-pickup-marker';
    el.style.cssText = `
      width: 44px;
      height: 44px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Glassmorphism effect outer ring
    const glassRing = document.createElement('div');
    glassRing.style.cssText = `
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: ${shadows.medium};
    `;
    el.appendChild(glassRing);

    // Main pickup dot
    const mainDot = document.createElement('div');
    mainDot.style.cssText = `
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #276EF1;
      border: 3px solid white;
      box-shadow: ${shadows.small};
      z-index: 2;
      position: relative;
    `;
    el.appendChild(mainDot);

    // Add pulse ring animation
    const pulseRing = document.createElement('div');
    pulseRing.style.cssText = `
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #276EF1;
      opacity: 0;
      z-index: 1;
    `;
    el.appendChild(pulseRing);

    // Add iOS Deluxe ping animation
    if (!document.getElementById('ios-deluxe-ping-styles')) {
      const pingStyle = document.createElement('style');
      pingStyle.id = 'ios-deluxe-ping-styles';
      pingStyle.textContent = `
        @keyframes ios-deluxe-ping {
          0% { transform: scale(0.8); opacity: 0.8; }
          70%, 100% { transform: scale(1.8); opacity: 0; }
        }
        .ios-deluxe-pickup-marker > div:last-child {
          animation: ios-deluxe-ping 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `;
      document.head.appendChild(pingStyle);
    }

    pickupMarker.current = new mapboxgl.Marker(el)
      .setLngLat([pickupLocation.lng, pickupLocation.lat])
      .addTo(map.current);

    return () => {
      if (pickupMarker.current) {
        pickupMarker.current.remove();
      }
    };
  }, [pickupLocation, isMapLoaded]);

  // Create dropoff marker with iOS Deluxe styling
  useEffect(() => {
    if (!map.current || !isMapLoaded || !dropoffLocation) return;

    if (dropoffMarker.current) {
      dropoffMarker.current.remove();
    }

    // Create container element
    const el = document.createElement('div');
    el.className = 'ios-deluxe-dropoff-marker';
    el.style.cssText = `
      width: 44px;
      height: 44px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Glassmorphism effect for depth
    const glassCircle = document.createElement('div');
    glassCircle.style.cssText = `
      position: absolute;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: ${shadows.medium};
    `;
    el.appendChild(glassCircle);
    
    // Main destination dot
    const mainDot = document.createElement('div');
    mainDot.style.cssText = `
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: ${colors.accent || '#10B981'};
      border: 3px solid white;
      box-shadow: ${shadows.small};
      z-index: 2;
      position: relative;
    `;
    el.appendChild(mainDot);
    
    // Subtle glow effect
    const glowEffect = document.createElement('div');
    glowEffect.style.cssText = `
      position: absolute;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: radial-gradient(circle, ${colors.accent || '#10B981'}30 0%, transparent 70%);
      z-index: 0;
    `;
    el.appendChild(glowEffect);

    dropoffMarker.current = new mapboxgl.Marker(el)
      .setLngLat([dropoffLocation.lng, dropoffLocation.lat])
      .addTo(map.current);

    return () => {
      if (dropoffMarker.current) {
        dropoffMarker.current.remove();
      }
    };
  }, [dropoffLocation, isMapLoaded]);

  // Fetch route from Mapbox Directions API
  const fetchRoute = async (start, end) => {
    if (!start || !end || !mapboxToken) return null;

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${mapboxToken}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          geometry: route.geometry,
          duration: route.duration, // in seconds
          distance: route.distance, // in meters
        };
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }

    return null;
  };

  // 🎯 DUAL-PHASE ROUTE VISUALIZATION with explicit phase transition
  // PHASE 1: Driver → Pickup (Pre-OTP)
  // PHASE 2: Pickup → Destination (Post-OTP with route clearing)
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    if (!validateCoordinates(driverLocation)) return;

    const updateRoute = async () => {
      let start, end;

      // 🔄 PHASE TRANSITION DETECTION: Clear route when phase changes
      if (previousPhaseRef.current && previousPhaseRef.current !== currentPhase) {
        // Phase transition detected - clear old route
        if (map.current.getSource('route')) {
          map.current.getSource('route').setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          });
        }
        
        // Reset ETA and distance on phase change
        setEta(null);
        setDistance(null);
      }
      
      previousPhaseRef.current = currentPhase;

      // 🎯 PHASE 1: PRE-PICKUP (Driver → User Pickup Location)
      if (isPrePickup && validateCoordinates(pickupLocation)) {
        start = driverLocation;
        end = pickupLocation;
      } 
      // 🎯 PHASE 2: IN-PROGRESS (Current Location → Final Destination)
      else if (isInProgress && validateCoordinates(dropoffLocation)) {
        start = driverLocation;
        end = dropoffLocation;
      } 
      else {
        return; // No valid phase
      }

      const routeData = await fetchRoute(start, end);

      if (routeData && routeData.geometry) {
        setRouteGeometry(routeData.geometry);
        setDistance(routeData.distance);
        setEta(routeData.duration);

        // Update route layer with new geometry
        if (map.current.getSource('route')) {
          map.current.getSource('route').setData({
            type: 'Feature',
            properties: {},
            geometry: routeData.geometry
          });
        }

        // Notify parent component of ETA update
        if (onETAUpdate) {
          onETAUpdate({
            eta: routeData.duration,
            distance: routeData.distance,
            phase: currentPhase,
          });
        }
      }
    };

    updateRoute();

    // Adaptive route recalculation using constants
    const getRecalculationInterval = () => {
      return routeRecalculationCount.current < CONFIG.ROUTE_RECALC_THRESHOLD 
        ? CONFIG.INITIAL_ROUTE_UPDATE_INTERVAL 
        : CONFIG.STANDARD_ROUTE_UPDATE_INTERVAL;
    };

    updateInterval.current = setInterval(() => {
      routeRecalculationCount.current++;
      updateRoute();
    }, getRecalculationInterval());

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [
    driverLocation, 
    pickupLocation, 
    dropoffLocation, 
    isPrePickup, 
    isInProgress, 
    isMapLoaded, 
    onETAUpdate,
    currentPhase,
    validateCoordinates
  ]);

  // 🎯 INTELLIGENT AUTO-FIT BOUNDS with 50px padding
  // Dynamically adjusts zoom to keep driver and target always visible
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    if (!validateCoordinates(driverLocation)) return;

    const locations = [];
    
    // Always include driver location
    locations.push([driverLocation.lng, driverLocation.lat]);
    
    // Include target based on phase
    if (isPrePickup && validateCoordinates(pickupLocation)) {
      locations.push([pickupLocation.lng, pickupLocation.lat]);
    } else if (isInProgress && validateCoordinates(dropoffLocation)) {
      locations.push([dropoffLocation.lng, dropoffLocation.lat]);
    }

    if (locations.length > 1) {
      // Calculate bounds to fit all markers
      const bounds = locations.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(locations[0], locations[0]));

      // Calculate distance between points for smart zoom adjustment
      const distance = map.current 
        ? calculateDistance(
            [locations[0][0], locations[0][1]], 
            [locations[1][0], locations[1][1]]
          )
        : 0;

      // 🎯 Smart zoom based on distance
      let maxZoom = 16;
      if (distance < 500) maxZoom = 17; // Very close - zoom in more
      else if (distance < 1000) maxZoom = 16; // Close
      else if (distance < 5000) maxZoom = 15; // Medium distance
      else if (distance < 10000) maxZoom = 14; // Far
      else maxZoom = 13; // Very far

      // Smooth camera transition with configurable padding
      map.current.fitBounds(bounds, {
        padding: CONFIG.MAP_FIT_BOUNDS_PADDING,
        maxZoom: maxZoom,
        duration: CONFIG.MAP_FIT_BOUNDS_DURATION,
        essential: true,
      });
    }
  }, [
    driverLocation, 
    pickupLocation, 
    dropoffLocation, 
    isPrePickup, 
    isInProgress, 
    isMapLoaded,
    validateCoordinates
  ]);

  // Enhanced location timeout detection (30 seconds threshold)
  useEffect(() => {
    if (!driverLocation) return;

    // Reset timeout when location updates
    setLastLocationUpdate(Date.now());
    setLocationTimeout(false);
    setTrackingError(null);

    // Clear existing timeout
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    // Set new timeout using configuration constant
    locationTimeoutRef.current = setTimeout(() => {
      setLocationTimeout(true);
      setTrackingError('GPS_TIMEOUT');
    }, CONFIG.LOCATION_TIMEOUT_THRESHOLD);

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, [driverLocation]);

  // Listen for real-time location updates via socket with error handling
  useEffect(() => {
    if (!socket || !rideId) return;

    const handleLocationUpdate = (data) => {
      if (data.rideId === rideId && data.location) {
        // Location update will be handled by parent component
        // which will update driverLocation prop
        setTrackingError(null);
        setLocationTimeout(false);
      }
    };

    const handleLocationError = (error) => {
      console.error('Location update error:', error);
      setTrackingError('GPS_ERROR');
    };

    socket.on('driver:locationUpdated', handleLocationUpdate);
    socket.on('driver:locationError', handleLocationError);

    return () => {
      socket.off('driver:locationUpdated', handleLocationUpdate);
      socket.off('driver:locationError', handleLocationError);
    };
  }, [socket, rideId]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {/* iOS Deluxe ETA and Distance Info Overlay */}
      <AnimatePresence>
        {eta && distance && userType === "user" && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 w-auto max-w-xs"
          >
            <div className="backdrop-blur-xl bg-white/20 border border-white/30 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-5">
              <div className="flex items-center gap-2">
                {/* Vehicle icon in glass circle */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full" />
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-[${colors.accent}]/80 to-[${colors.accent}]/40 backdrop-blur-sm flex items-center justify-center shadow-md`}>
                    <img 
                      src={vehicleIcon} 
                      alt={vehicleType === 'bike' ? 'Moto' : 'Carro'}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        const target = e.target;
                        target.style.display = 'none';
                        const fallback = document.createElement('span');
                        fallback.textContent = vehicleType === 'bike' ? '🛵' : '🚗';
                        fallback.style.fontSize = '18px';
                        target.parentElement.appendChild(fallback);
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-white/70">
                    {isPrePickup ? "Llegada conductor" : "Llegada estimada"}
                  </div>
                  <div className="text-base font-semibold text-white">
                    {formatDuration(eta)}
                  </div>
                </div>
              </div>
              
              <div className="h-8 w-px bg-white/20" />
              
              <div>
                <div className="text-xs text-white/70">Distancia</div>
                <div className="text-base font-semibold text-white">
                  {formatDistance(distance)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Phase Indicator - iOS Deluxe Style */}
      {userType === "user" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.2 }}
          className="absolute bottom-24 left-4 z-10"
        >
          <div className="backdrop-blur-lg bg-white/20 border border-white/30 px-4 py-3 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-[${isPrePickup ? '#3B82F6' : colors.accent}] animate-pulse`} />
              <div className="text-sm font-medium text-white">
                {isPrePickup ? "Conductor en camino" : "En viaje"}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error States - iOS Deluxe Style */}
      <AnimatePresence>
        {locationTimeout && userType === "user" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="backdrop-blur-xl bg-[#FFEDD5]/40 border border-[#FED7AA]/50 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFBA42]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#92400E]">Esperando ubicación del conductor...</span>
            </div>
          </motion.div>
        )}

        {trackingError === 'GPS_ERROR' && userType === "user" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}  
            className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="backdrop-blur-xl bg-[#FEE2E2]/40 border border-[#FCA5A5]/50 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#DC2626]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#B91C1C]">Error de GPS. Reconectando...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EliteTrackingMap;
