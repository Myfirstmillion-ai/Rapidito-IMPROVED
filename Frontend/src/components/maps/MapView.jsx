import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "../../utils/cn";

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function MapView({ 
  center = [-72.4430, 7.8146], // Default: San Antonio del Táchira
  zoom = 13,
  markers = [],
  route = null,
  onMapLoad,
  className,
  style = "mapbox://styles/mapbox/streets-v12",
  interactive = true
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    if (!mapContainer.current) return; // Ensure container exists

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: center,
        zoom: zoom,
        interactive: interactive,
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
      if (interactive) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      }
    } catch (error) {
      console.error('Failed to initialize Mapbox map:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (map.current && isMapLoaded) {
      map.current.flyTo({
        center: center,
        zoom: zoom,
        essential: true,
      });
    }
  }, [center, zoom, isMapLoaded]);

  // Update markers
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const el = document.createElement('div');
      el.className = markerData.className || 'marker';
      el.innerHTML = markerData.html || '<div class="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>';

      const marker = new mapboxgl.Marker(el)
        .setLngLat(markerData.coordinates)
        .addTo(map.current);

      if (markerData.popup) {
        marker.setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(markerData.popup)
        );
      }

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [markers, isMapLoaded]);

  // Update route
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
        'line-color': '#10b981',
        'line-width': 5,
        'line-opacity': 0.8,
      },
    });

    // Fit bounds to route
    if (route.geometry && route.geometry.coordinates) {
      const coordinates = route.geometry.coordinates;
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, {
        padding: 50,
      });
    }
  }, [route, isMapLoaded]);

  return (
    <div 
      ref={mapContainer} 
      className={cn("w-full h-full rounded-lg overflow-hidden", className)}
      style={{ minHeight: '300px' }}
    />
  );
}

export default MapView;
