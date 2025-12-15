import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "../../utils/cn";
import { Navigation, Clock } from "lucide-react";

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * LiveTrackingMap Component for Real-Time Ride Tracking
 * 
 * Features:
 * - Interactive Mapbox GL JS map
 * - Animated driver marker with vehicle-specific icons (car/bike)
 * - User pickup marker with pin emoji (📍)
 * - Dropoff destination marker (green)
 * - Route visualization with polyline
 * - Glassmorphism ETA overlay display
 * - Smooth driver location updates with easeTo()
 * - Auto fitBounds for full route view
 * 
 * @param {Object} props
 * @param {Array} props.driverLocation - [lng, lat]
 * @param {Array} props.pickupLocation - [lng, lat]
 * @param {Array} props.dropoffLocation - [lng, lat]
 * @param {Object} props.route - Route geometry from Mapbox Directions
 * @param {number} props.eta - Estimated time of arrival in minutes
 * @param {string} props.driverName - Driver name for display
 * @param {string} props.vehicleType - Vehicle type ('car' or 'bike')
 * @param {Function} props.onMapLoad - Callback when map loads
 * @param {string} props.className - Additional CSS classes
 */
function LiveTrackingMap({ 
  driverLocation,
  pickupLocation,
  dropoffLocation,
  route = null,
  eta = null,
  driverName = "Conductor",
  vehicleType = "car",
  onMapLoad,
  className,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const driverMarker = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    if (!mapContainer.current) return; // Ensure container exists

    const initialCenter = driverLocation || pickupLocation || [-72.4430, 7.8146];

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: initialCenter,
        zoom: 14,
        interactive: true,
        preserveDrawingBuffer: true, // Prevents WebGL context loss and improves compatibility with certain browsers/devices
      });

      map.current.on('load', () => {
        setIsMapLoaded(true);
        onMapLoad?.(map.current);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    } catch (error) {
      console.error('Failed to initialize Mapbox map:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Create custom driver marker with vehicle-specific icon
  useEffect(() => {
    if (!map.current || !isMapLoaded || !driverLocation) return;

    // Remove existing driver marker
    if (driverMarker.current) {
      driverMarker.current.remove();
    }

    // Create custom marker element using vehicle-specific image
    const el = document.createElement('div');
    el.className = 'driver-marker';
    
    const container = document.createElement('div');
    container.className = 'relative';
    
    // Vehicle image based on type
    const vehicleImage = vehicleType === 'car' ? '/Uber-PNG-Photos.png' : '/bike.webp';
    
    const img = document.createElement('img');
    img.src = vehicleImage;
    img.className = 'w-12 h-12 rounded-full border-2 border-white shadow-lg object-contain bg-white/90';
    img.alt = vehicleType === 'car' ? 'Carro' : 'Moto';
    
    // Pulse animation background
    const pulse = document.createElement('div');
    pulse.className = 'absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-50';
    
    container.appendChild(pulse);
    container.appendChild(img);
    el.appendChild(container);

    driverMarker.current = new mapboxgl.Marker(el)
      .setLngLat(driverLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`<div class="text-center font-semibold">${driverName}</div>`)
      )
      .addTo(map.current);

    return () => {
      if (driverMarker.current) {
        driverMarker.current.remove();
      }
    };
  }, [driverLocation, isMapLoaded, driverName, vehicleType]);

  // Update driver location with smooth animation
  useEffect(() => {
    if (!driverMarker.current || !driverLocation) return;

    // Animate marker to new position
    driverMarker.current.setLngLat(driverLocation);

    // Smoothly pan map to follow driver
    if (map.current) {
      map.current.easeTo({
        center: driverLocation,
        duration: 1000,
        essential: true,
      });
    }
  }, [driverLocation]);

  // Add pickup marker (user pin 📍)
  useEffect(() => {
    if (!map.current || !isMapLoaded || !pickupLocation) return;

    if (pickupMarker.current) {
      pickupMarker.current.remove();
    }

    // Create pickup marker using pin emoji
    const el = document.createElement('div');
    el.className = 'text-4xl leading-none';
    el.textContent = '📍';
    el.style.cursor = 'pointer';

    pickupMarker.current = new mapboxgl.Marker(el)
      .setLngLat(pickupLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML('<div class="text-center font-semibold text-blue-600">Usuario</div>')
      )
      .addTo(map.current);

    return () => {
      if (pickupMarker.current) {
        pickupMarker.current.remove();
      }
    };
  }, [pickupLocation, isMapLoaded]);

  // Add dropoff marker (green)
  useEffect(() => {
    if (!map.current || !isMapLoaded || !dropoffLocation) return;

    if (dropoffMarker.current) {
      dropoffMarker.current.remove();
    }

    // Create dropoff marker using DOM methods
    const el = document.createElement('div');
    const container = document.createElement('div');
    container.className = 'relative';
    
    const markerDiv = document.createElement('div');
    markerDiv.className = 'w-10 h-10 bg-uber-green rounded-full border-4 border-white shadow-uber-md flex items-center justify-center';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w-5 h-5 text-white');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('d', 'M5 13l4 4L19 7');
    
    svg.appendChild(path);
    markerDiv.appendChild(svg);
    container.appendChild(markerDiv);
    el.appendChild(container);

    dropoffMarker.current = new mapboxgl.Marker(el)
      .setLngLat(dropoffLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML('<div class="text-center font-semibold text-uber-green">Destino</div>')
      )
      .addTo(map.current);

    return () => {
      if (dropoffMarker.current) {
        dropoffMarker.current.remove();
      }
    };
  }, [dropoffLocation, isMapLoaded]);

  // Draw route
  useEffect(() => {
    if (!map.current || !isMapLoaded || !route) return;

    // Remove existing route layer
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    // Add new route
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route.geometry || route,
      },
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#10b981', // Emerald color
        'line-width': 4,
        'line-opacity': 0.9,
      },
    });

    // Fit bounds to show entire route
    if (route.geometry && route.geometry.coordinates) {
      const coordinates = route.geometry.coordinates;
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15,
      });
    }
  }, [route, isMapLoaded]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-uber-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {/* Glassmorphism ETA Overlay */}
      {eta !== null && (
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Tiempo estimado</p>
              <p className="text-xl font-bold text-white">{eta} min</p>
            </div>
          </div>
        </div>
      )}

      {/* Driver info overlay - Glassmorphism */}
      {driverName && driverLocation && (
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
              <Navigation size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Conductor</p>
              <p className="text-sm font-bold text-white">{driverName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveTrackingMap;
