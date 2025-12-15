import { useEffect, useRef, useState, useContext } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { SocketDataContext } from "../../contexts/SocketContext";
import { cn } from "../../utils/cn";

// Set Mapbox access token
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
if (!mapboxToken) {
  console.warn("VITE_MAPBOX_TOKEN not found in environment variables");
}
mapboxgl.accessToken = mapboxToken || "";

/**
 * Real-Time Ride Tracking Component
 * Shows both driver and passenger on the map with real-time updates
 * 
 * @param {Object} props
 * @param {Array} props.driverLocation - [lng, lat]
 * @param {Array} props.pickupLocation - [lng, lat]
 * @param {Array} props.dropoffLocation - [lng, lat]
 * @param {string} props.rideId - Current ride ID
 * @param {string} props.userId - User ID for socket tracking
 * @param {string} props.userType - "user" or "captain"
 * @param {string} props.className - Additional CSS classes
 */
function RealTimeTrackingMap({
  driverLocation,
  pickupLocation,
  dropoffLocation,
  rideId,
  userId,
  userType = "user",
  className,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const driverMarker = useRef(null);
  const userMarker = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { socket } = useContext(SocketDataContext);

  // Initialize map
  useEffect(() => {
    if (map.current) return;
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

  // Create driver marker
  useEffect(() => {
    if (!map.current || !isMapLoaded || !driverLocation) return;

    if (driverMarker.current) {
      driverMarker.current.remove();
    }

    // Create driver marker element
    const el = document.createElement('div');
    el.className = 'driver-marker';
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#000000';
    el.style.border = '4px solid white';
    el.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.innerHTML = '<span style="color: white; font-size: 20px;">🚗</span>';

    driverMarker.current = new mapboxgl.Marker(el)
      .setLngLat(driverLocation)
      .addTo(map.current);

    return () => {
      if (driverMarker.current) {
        driverMarker.current.remove();
      }
    };
  }, [driverLocation, isMapLoaded]);

  // Update driver location with smooth animation
  useEffect(() => {
    if (!driverMarker.current || !driverLocation) return;

    driverMarker.current.setLngLat(driverLocation);

    // Center map on driver if captain
    if (map.current && userType === "captain") {
      map.current.easeTo({
        center: driverLocation,
        duration: 1000,
      });
    }
  }, [driverLocation, userType]);

  // Add pickup marker (blue)
  useEffect(() => {
    if (!map.current || !isMapLoaded || !pickupLocation) return;

    if (pickupMarker.current) {
      pickupMarker.current.remove();
    }

    const el = document.createElement('div');
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#276EF1';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    pickupMarker.current = new mapboxgl.Marker(el)
      .setLngLat(pickupLocation)
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

    const el = document.createElement('div');
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#05A357';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    dropoffMarker.current = new mapboxgl.Marker(el)
      .setLngLat(dropoffLocation)
      .addTo(map.current);

    return () => {
      if (dropoffMarker.current) {
        dropoffMarker.current.remove();
      }
    };
  }, [dropoffLocation, isMapLoaded]);

  // Listen for location updates via socket
  useEffect(() => {
    if (!socket || !rideId) return;

    const handleLocationUpdate = (data) => {
      if (data.rideId === rideId && data.location) {
        // Update driver marker position
        const newLocation = [data.location.lng, data.location.lat];
        if (driverMarker.current) {
          driverMarker.current.setLngLat(newLocation);
          
          // Center map if user is passenger
          if (map.current && userType === "user") {
            map.current.easeTo({
              center: newLocation,
              duration: 1000,
            });
          }
        }
      }
    };

    socket.on('driver:locationUpdated', handleLocationUpdate);

    return () => {
      socket.off('driver:locationUpdated', handleLocationUpdate);
    };
  }, [socket, rideId, userType]);

  // Fit bounds to show all markers
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const locations = [driverLocation, pickupLocation, dropoffLocation].filter(Boolean);
    
    if (locations.length > 1) {
      const bounds = locations.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(locations[0], locations[0]));

      map.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15,
        duration: 1000,
      });
    }
  }, [driverLocation, pickupLocation, dropoffLocation, isMapLoaded]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

export default RealTimeTrackingMap;
