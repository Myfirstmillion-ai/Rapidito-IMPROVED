import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "../../utils/cn";
import { Navigation, Clock, MapPin, Gauge } from "lucide-react";
import { TrackingManager } from "../../services/tracking";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * ProfessionalTrackingMap - Uber-level real-time tracking
 * 
 * Features:
 * - 60fps smooth driver marker animation
 * - Interpolation between GPS updates
 * - Heading-based marker rotation
 * - Gradient route visualization
 * - Glassmorphism ETA card with live updates
 * - Memory-efficient with proper cleanup
 */
function ProfessionalTrackingMap({
  driverLocation,
  pickupLocation,
  dropoffLocation,
  route = null,
  eta = null,
  distance = null,
  speed = 0,
  heading = 0,
  driverName = "Conductor",
  vehicleType = "car",
  rideStatus = "accepted",
  onMapLoad,
  className,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const driverMarkerEl = useRef(null);
  const driverMarker = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);
  const trackingManager = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [currentETA, setCurrentETA] = useState(eta);
  const [currentDistance, setCurrentDistance] = useState(distance);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [currentHeading, setCurrentHeading] = useState(heading);

  // Animation duration from env or default
  const animationDuration = useMemo(() => {
    return parseInt(import.meta.env.VITE_MAP_ANIMATION_DURATION) || 3000;
  }, []);

  // Initialize tracking manager
  useEffect(() => {
    trackingManager.current = new TrackingManager({
      animationDuration,
      predictionEnabled: true,
      onPositionUpdate: (position) => {
        if (driverMarker.current && map.current) {
          // Update marker position smoothly
          driverMarker.current.setLngLat([position.lng, position.lat]);
          
          // Rotate marker based on heading
          if (driverMarkerEl.current && position.heading !== undefined) {
            driverMarkerEl.current.style.transform = `rotate(${position.heading}deg)`;
            setCurrentHeading(position.heading);
          }
        }
      },
      onETAUpdate: ({ eta, distance, speed }) => {
        if (eta !== undefined) setCurrentETA(eta);
        if (distance !== undefined) setCurrentDistance(distance);
        if (speed !== undefined) setCurrentSpeed(speed);
      },
      onError: (error) => {
        console.error("Tracking error:", error);
      },
    });

    trackingManager.current.start();

    return () => {
      trackingManager.current?.destroy();
    };
  }, [animationDuration]);

  // Update tracking manager when driver location changes
  useEffect(() => {
    if (!trackingManager.current || !driverLocation) return;

    trackingManager.current.updateLocation({
      lat: driverLocation[1],
      lng: driverLocation[0],
      heading,
      speed,
      eta,
      distance,
      timestamp: Date.now(),
    });
  }, [driverLocation, heading, speed, eta, distance]);

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    const initialCenter = driverLocation || pickupLocation || [-72.4430, 7.8146];

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: initialCenter,
        zoom: 15,
        pitch: 45,
        bearing: 0,
        interactive: true,
        preserveDrawingBuffer: true,
        antialias: true,
      });

      map.current.on("load", () => {
        setIsMapLoaded(true);
        
        // Add 3D buildings for premium feel
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers.find(
          (layer) => layer.type === "symbol" && layer.layout["text-field"]
        )?.id;

        if (labelLayerId) {
          map.current.addLayer(
            {
              id: "3d-buildings",
              source: "composite",
              "source-layer": "building",
              filter: ["==", "extrude", "true"],
              type: "fill-extrusion",
              minzoom: 15,
              paint: {
                "fill-extrusion-color": "#1a1a2e",
                "fill-extrusion-height": ["get", "height"],
                "fill-extrusion-base": ["get", "min_height"],
                "fill-extrusion-opacity": 0.6,
              },
            },
            labelLayerId
          );
        }

        onMapLoad?.(map.current);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e.error);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Create driver marker with rotation support
  const createDriverMarker = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    // Remove existing marker
    if (driverMarker.current) {
      driverMarker.current.remove();
    }

    // Create marker element
    const el = document.createElement("div");
    el.className = "driver-marker-container";
    el.style.cssText = `
      width: 60px;
      height: 60px;
      position: relative;
      transition: transform 0.3s ease-out;
    `;

    // Vehicle icon container with rotation
    const vehicleContainer = document.createElement("div");
    vehicleContainer.className = "vehicle-icon";
    vehicleContainer.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    driverMarkerEl.current = vehicleContainer;

    // Pulse ring
    const pulseRing = document.createElement("div");
    pulseRing.style.cssText = `
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%);
      animation: pulse-ring 2s ease-out infinite;
    `;

    // Vehicle image
    const vehicleImg = document.createElement("img");
    vehicleImg.src = vehicleType === "car" ? "/Uber-PNG-Photos.png" : "/bike.webp";
    vehicleImg.alt = vehicleType === "car" ? "Carro" : "Moto";
    vehicleImg.style.cssText = `
      width: 48px;
      height: 48px;
      object-fit: contain;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      background: white;
      border-radius: 50%;
      padding: 4px;
      border: 3px solid #10b981;
    `;

    // Speed indicator
    const speedBadge = document.createElement("div");
    speedBadge.className = "speed-badge";
    speedBadge.style.cssText = `
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 10px;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    speedBadge.textContent = `${Math.round(currentSpeed || 0)} km/h`;

    vehicleContainer.appendChild(vehicleImg);
    el.appendChild(pulseRing);
    el.appendChild(vehicleContainer);
    el.appendChild(speedBadge);

    // Add CSS animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    const location = driverLocation || pickupLocation || [-72.4430, 7.8146];
    
    driverMarker.current = new mapboxgl.Marker({
      element: el,
      anchor: "center",
      rotationAlignment: "map",
    })
      .setLngLat(location)
      .addTo(map.current);

    return () => {
      style.remove();
    };
  }, [isMapLoaded, vehicleType, currentSpeed]);

  // Initialize driver marker
  useEffect(() => {
    if (!isMapLoaded) return;
    const cleanup = createDriverMarker();
    return cleanup;
  }, [isMapLoaded, createDriverMarker]);

  // Update speed badge
  useEffect(() => {
    const speedBadge = document.querySelector(".speed-badge");
    if (speedBadge) {
      speedBadge.textContent = `${Math.round(currentSpeed || 0)} km/h`;
    }
  }, [currentSpeed]);

  // Add pickup marker
  useEffect(() => {
    if (!map.current || !isMapLoaded || !pickupLocation) return;

    if (pickupMarker.current) {
      pickupMarker.current.remove();
    }

    const el = document.createElement("div");
    el.style.cssText = `
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const inner = document.createElement("div");
    inner.style.cssText = `
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      transform: rotate(45deg);
    `;
    el.appendChild(inner);

    pickupMarker.current = new mapboxgl.Marker(el)
      .setLngLat(pickupLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
          '<div class="text-center font-semibold text-blue-600 p-2">📍 Punto de recogida</div>'
        )
      )
      .addTo(map.current);

    return () => {
      pickupMarker.current?.remove();
    };
  }, [pickupLocation, isMapLoaded]);

  // Add dropoff marker
  useEffect(() => {
    if (!map.current || !isMapLoaded || !dropoffLocation) return;

    if (dropoffMarker.current) {
      dropoffMarker.current.remove();
    }

    const el = document.createElement("div");
    el.style.cssText = `
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const checkmark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    checkmark.setAttribute("width", "20");
    checkmark.setAttribute("height", "20");
    checkmark.setAttribute("viewBox", "0 0 24 24");
    checkmark.setAttribute("fill", "none");
    checkmark.setAttribute("stroke", "white");
    checkmark.setAttribute("stroke-width", "3");
    checkmark.setAttribute("stroke-linecap", "round");
    checkmark.setAttribute("stroke-linejoin", "round");
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M5 13l4 4L19 7");
    checkmark.appendChild(path);
    el.appendChild(checkmark);

    dropoffMarker.current = new mapboxgl.Marker(el)
      .setLngLat(dropoffLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
          '<div class="text-center font-semibold text-emerald-600 p-2">🎯 Destino</div>'
        )
      )
      .addTo(map.current);

    return () => {
      dropoffMarker.current?.remove();
    };
  }, [dropoffLocation, isMapLoaded]);

  // Draw route with gradient
  useEffect(() => {
    if (!map.current || !isMapLoaded || !route) return;

    // Remove existing layers
    ["route-glow", "route-line", "route-traveled"].forEach((layerId) => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });
    
    ["route", "route-traveled-source"].forEach((sourceId) => {
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });

    const geometry = route.geometry || route;

    // Add route source
    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry,
      },
    });

    // Glow effect layer
    map.current.addLayer({
      id: "route-glow",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#10b981",
        "line-width": 12,
        "line-opacity": 0.2,
        "line-blur": 3,
      },
    });

    // Main route line
    map.current.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#10b981",
        "line-width": 5,
        "line-opacity": 0.9,
      },
    });

    // Fit bounds
    if (geometry.coordinates) {
      const bounds = geometry.coordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new mapboxgl.LngLatBounds(geometry.coordinates[0], geometry.coordinates[0])
      );

      map.current.fitBounds(bounds, {
        padding: { top: 100, bottom: 150, left: 50, right: 50 },
        maxZoom: 16,
        duration: 1000,
      });
    }
  }, [route, isMapLoaded]);

  // Format distance for display
  const formatDistance = (distanceKm) => {
    if (!distanceKm) return null;
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  };

  // Calculate arrival time
  const getArrivalTime = () => {
    if (!currentETA) return null;
    const arrival = new Date(Date.now() + currentETA * 60000);
    return arrival.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={cn("relative w-full h-full", className)}>
      <div
        ref={mapContainer}
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{ minHeight: "400px" }}
      />

      {/* Premium ETA Card - Glassmorphism */}
      {currentETA !== null && (
        <div className="absolute top-4 left-4 right-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-10">
          <div className="flex items-center justify-between">
            {/* ETA */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  {rideStatus === "accepted" ? "Llegada conductor" : "Llegada destino"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{currentETA}</span>
                  <span className="text-sm text-slate-400">min</span>
                </div>
              </div>
            </div>

            {/* Distance & Arrival */}
            <div className="text-right">
              {currentDistance && (
                <p className="text-sm text-slate-300 font-medium">
                  {formatDistance(currentDistance)}
                </p>
              )}
              {getArrivalTime() && (
                <p className="text-xs text-slate-500">
                  Llega ~{getArrivalTime()}
                </p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(5, 100 - (currentETA || 0) * 2)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Driver Info Card */}
      {driverName && driverLocation && (
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
              <Navigation
                size={20}
                className="text-white"
                style={{ transform: `rotate(${currentHeading}deg)` }}
              />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Conductor</p>
              <p className="text-sm font-bold text-white">{driverName}</p>
            </div>
            {currentSpeed > 0 && (
              <div className="ml-4 flex items-center gap-1 text-emerald-400">
                <Gauge size={14} />
                <span className="text-xs font-medium">{Math.round(currentSpeed)} km/h</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reconnecting indicator */}
      {!driverLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl px-6 py-4 shadow-2xl z-20">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-amber-400 font-medium">Conectando con conductor...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfessionalTrackingMap;
