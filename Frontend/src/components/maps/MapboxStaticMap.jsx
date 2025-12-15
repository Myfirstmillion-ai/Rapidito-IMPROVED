import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PropTypes from 'prop-types';
import { colors, shadows, borderRadius } from '../../styles/designSystem';

// Mapbox access token from environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Set the token globally
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
} else {
  console.warn('⚠️ VITE_MAPBOX_TOKEN not found in environment variables');
}

/**
 * MapboxStaticMap - A static, professional Mapbox GL JS component
 * Replaces Google Maps iframes with a modern, interactive Mapbox map
 * 
 * @component
 * @param {Object} props
 * @param {number} props.latitude - Center latitude
 * @param {number} props.longitude - Center longitude
 * @param {number} props.zoom - Zoom level (1-20, default: 13)
 * @param {string} props.style - Mapbox style URL (default: streets-v12)
 * @param {boolean} props.interactive - Enable map interactions (default: true)
 * @param {boolean} props.showMarker - Show center marker (default: true)
 * @param {string} props.markerColor - Marker color (default: #276EF1)
 * @param {string} props.className - Additional CSS classes
 */
function MapboxStaticMap({
  latitude,
  longitude,
  zoom = 13,
  style = 'mapbox://styles/mapbox/streets-v12',
  interactive = true,
  showMarker = true,
  markerColor = '#276EF1',
  className = ''
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Check if token is available
    if (!MAPBOX_TOKEN) {
      console.error('❌ Mapbox token is required. Set VITE_MAPBOX_TOKEN in .env file');
      return;
    }

    // Initialize map only once
    if (map.current) return;

    try {
      // Create map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: [longitude, latitude],
        zoom: zoom,
        interactive: interactive,
        attributionControl: true,
        logoPosition: 'bottom-right'
      });

      // Add navigation controls if interactive
      if (interactive) {
        map.current.addControl(
          new mapboxgl.NavigationControl({
            showCompass: true,
            showZoom: true
          }),
          'top-right'
        );
      }

      // Add marker if enabled
      if (showMarker) {
        // Create custom marker element with iOS Deluxe style
        const markerEl = document.createElement('div');
        markerEl.className = 'mapbox-custom-marker';
        
        // Create outer ring container
        markerEl.style.position = 'relative';
        markerEl.style.width = '32px';
        markerEl.style.height = '32px';
        
        // Main marker dot
        const markerDot = document.createElement('div');
        markerDot.style.position = 'absolute';
        markerDot.style.inset = '0';
        markerDot.style.borderRadius = '50%';
        markerDot.style.backgroundColor = markerColor;
        markerDot.style.border = '3px solid rgba(255, 255, 255, 0.8)';
        markerDot.style.boxShadow = shadows.large;
        markerDot.style.cursor = 'pointer';
        markerDot.style.transform = 'scale(1)';
        markerDot.style.zIndex = '1';
        
        // Pulse effect
        const pulseDot = document.createElement('div');
        pulseDot.style.position = 'absolute';
        pulseDot.style.inset = '-8px';
        pulseDot.style.borderRadius = '50%';
        pulseDot.style.backgroundColor = `${markerColor}40`; // 25% opacity
        pulseDot.style.animation = 'pulse-animation 2s infinite';
        pulseDot.style.zIndex = '0';
        
        // Create animation style
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
          @keyframes pulse-animation {
            0% { transform: scale(0.95); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 0; }
            100% { transform: scale(0.95); opacity: 0; }
          }
        `;
        document.head.appendChild(styleSheet);
        
        // Append elements
        markerEl.appendChild(pulseDot);
        markerEl.appendChild(markerDot);

        marker.current = new mapboxgl.Marker({
          element: markerEl,
          anchor: 'center'
        })
          .setLngLat([longitude, latitude])
          .addTo(map.current);
      }

      // Map loaded event
      map.current.on('load', () => {
        setMapLoaded(true);
        console.log('✅ Mapbox map loaded successfully');
      });

      // Error handling
      map.current.on('error', (e) => {
        console.error('❌ Mapbox error:', e);
      });

    } catch (error) {
      console.error('❌ Failed to initialize Mapbox map:', error);
    }

    // Cleanup on unmount
    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Empty dependency array - initialize once

  // Update center when coordinates change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    try {
      // Fly to new location
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom,
        duration: 1500,
        essential: true
      });

      // Update marker position
      if (marker.current && showMarker) {
        marker.current.setLngLat([longitude, latitude]);
      }
    } catch (error) {
      console.error('❌ Error updating map center:', error);
    }
  }, [latitude, longitude, zoom, mapLoaded, showMarker]);

  return (
    <div 
      ref={mapContainer} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '300px' }}
    />
  );
}

MapboxStaticMap.propTypes = {
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  zoom: PropTypes.number,
  style: PropTypes.string,
  interactive: PropTypes.bool,
  showMarker: PropTypes.bool,
  markerColor: PropTypes.string,
  className: PropTypes.string
};

export default MapboxStaticMap;
