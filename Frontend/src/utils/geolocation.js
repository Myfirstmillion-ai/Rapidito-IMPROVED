/**
 * Enterprise-Level Geolocation Utilities
 * Handles GPS permissions, error recovery, and privacy controls
 */

/**
 * Check if geolocation is supported
 * @returns {boolean}
 */
export const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

/**
 * Request geolocation permission and get current position
 * @param {Object} options - Geolocation options
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const requestLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('GEOLOCATION_NOT_SUPPORTED'));
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        const errorMessages = {
          1: 'PERMISSION_DENIED',
          2: 'POSITION_UNAVAILABLE',
          3: 'TIMEOUT'
        };
        reject(new Error(errorMessages[error.code] || 'UNKNOWN_ERROR'));
      },
      defaultOptions
    );
  });
};

/**
 * Watch position with automatic error recovery
 * @param {Function} onSuccess - Called with position data
 * @param {Function} onError - Called with error
 * @param {Object} options - Geolocation options
 * @returns {number} Watch ID for clearing
 */
export const watchLocation = (onSuccess, onError, options = {}) => {
  if (!isGeolocationSupported()) {
    onError(new Error('GEOLOCATION_NOT_SUPPORTED'));
    return null;
  }

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 5000,
    ...options
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp
      });
    },
    (error) => {
      const errorMessages = {
        1: 'PERMISSION_DENIED',
        2: 'POSITION_UNAVAILABLE',
        3: 'TIMEOUT'
      };
      onError(new Error(errorMessages[error.code] || 'UNKNOWN_ERROR'));
    },
    defaultOptions
  );

  return watchId;
};

/**
 * Clear location watch
 * @param {number} watchId
 */
export const clearLocationWatch = (watchId) => {
  if (watchId && isGeolocationSupported()) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Check permission status (if supported by browser)
 * @returns {Promise<string>} - 'granted', 'denied', 'prompt', or 'unsupported'
 */
export const checkPermissionStatus = async () => {
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'unsupported';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    return 'unsupported';
  }
};

/**
 * Throttle location updates to optimize performance
 * @param {Function} callback - Function to call with location
 * @param {number} delay - Minimum delay between calls (ms)
 * @returns {Function} Throttled function
 */
export const throttleLocation = (callback, delay = 5000) => {
  let lastCall = 0;
  let timeoutId = null;

  return (...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      callback(...args);
    } else {
      // Schedule the call for later
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        callback(...args);
      }, delay - timeSinceLastCall);
    }
  };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Check if location update is significant (> 10 meters)
 * @param {Object} oldLocation - {lat, lng}
 * @param {Object} newLocation - {lat, lng}
 * @returns {boolean}
 */
export const isSignificantLocationChange = (oldLocation, newLocation, threshold = 10) => {
  if (!oldLocation || !newLocation) return true;
  
  const distance = calculateDistance(
    oldLocation.lat,
    oldLocation.lng,
    newLocation.lat,
    newLocation.lng
  );
  
  return distance >= threshold;
};

/**
 * Privacy control: Only track during active ride
 * @param {string} rideStatus - Current ride status
 * @returns {boolean} Whether tracking should be active
 */
export const shouldTrackLocation = (rideStatus) => {
  const activeStatuses = ['accepted', 'ongoing', 'started'];
  return activeStatuses.includes(rideStatus);
};

/**
 * Get user-friendly error message
 * @param {Error} error
 * @returns {string}
 */
export const getLocationErrorMessage = (error) => {
  const messages = {
    'GEOLOCATION_NOT_SUPPORTED': 'Tu dispositivo no soporta geolocalización',
    'PERMISSION_DENIED': 'Por favor, permite el acceso a tu ubicación para continuar',
    'POSITION_UNAVAILABLE': 'No se pudo obtener tu ubicación. Verifica tu GPS',
    'TIMEOUT': 'Tiempo de espera agotado. Intenta de nuevo',
    'UNKNOWN_ERROR': 'Error desconocido al obtener ubicación'
  };

  return messages[error.message] || messages['UNKNOWN_ERROR'];
};

export default {
  isGeolocationSupported,
  requestLocation,
  watchLocation,
  clearLocationWatch,
  checkPermissionStatus,
  throttleLocation,
  calculateDistance,
  isSignificantLocationChange,
  shouldTrackLocation,
  getLocationErrorMessage
};
