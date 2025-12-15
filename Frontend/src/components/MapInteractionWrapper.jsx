import { useState, useRef, useEffect } from "react";

/**
 * MapInteractionWrapper - Handles touch/mouse interactions on map
 * Automatically hides/shows bottom panels when user interacts with map
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Map component
 * @param {boolean} props.panelsVisible - Current panel visibility state
 * @param {Function} props.onPanelsVisibilityChange - Callback when visibility should change
 * @param {string} props.className - Additional CSS classes
 */
function MapInteractionWrapper({ 
  children, 
  panelsVisible = true, 
  onPanelsVisibilityChange,
  className = "" 
}) {
  const interactionTimeoutRef = useRef(null);
  const lastTouchTimeRef = useRef(null);

  const handleInteractionStart = (e) => {
    // Only trigger if it's a touch on the map area (not on panels)
    const target = e.target;
    const isMapElement = target.classList.contains('mapboxgl-canvas') || 
                         target.closest('.mapboxgl-map');
    
    if (isMapElement) {
      lastTouchTimeRef.current = Date.now();
      
      // Hide panels when interacting with map
      if (panelsVisible && onPanelsVisibilityChange) {
        onPanelsVisibilityChange(false);
      }

      // Clear any existing timeout
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    }
  };

  const handleInteractionEnd = () => {
    // Wait 2 seconds of inactivity before showing panels again
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }

    interactionTimeoutRef.current = setTimeout(() => {
      if (!panelsVisible && onPanelsVisibilityChange) {
        onPanelsVisibilityChange(true);
      }
    }, 2000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full ${className}`}
      onTouchStart={handleInteractionStart}
      onTouchMove={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onMouseDown={handleInteractionStart}
      onMouseMove={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
    >
      {children}
    </div>
  );
}

export default MapInteractionWrapper;
