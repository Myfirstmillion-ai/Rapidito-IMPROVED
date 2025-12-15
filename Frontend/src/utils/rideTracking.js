/**
 * Utility functions for ride tracking and calculations
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Array} coord1 - [lng, lat]
 * @param {Array} coord2 - [lng, lat]
 * @returns {number} Distance in meters
 */
export function calculateDistance(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate ETA based on distance and average speed
 * @param {number} distance - Distance in meters
 * @param {number} averageSpeed - Average speed in km/h (default: 30)
 * @returns {number} ETA in minutes
 */
export function calculateETA(distance, averageSpeed = 30) {
  const distanceKm = distance / 1000;
  const timeHours = distanceKm / averageSpeed;
  const timeMinutes = Math.ceil(timeHours * 60);
  return timeMinutes;
}

/**
 * Calculate ETA from current location to destination
 * @param {Array} currentLocation - [lng, lat]
 * @param {Array} destination - [lng, lat]
 * @param {number} averageSpeed - Average speed in km/h (default: 30)
 * @returns {number} ETA in minutes
 */
export function calculateETAFromLocations(currentLocation, destination, averageSpeed = 30) {
  const distance = calculateDistance(currentLocation, destination);
  return calculateETA(distance, averageSpeed);
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Format ETA timestamp
 * @param {number} minutes - ETA in minutes
 * @returns {string} Formatted ETA time (HH:MM)
 */
export function formatETATime(minutes) {
  const now = new Date();
  const eta = new Date(now.getTime() + minutes * 60000);
  const hours = eta.getHours().toString().padStart(2, '0');
  const mins = eta.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

/**
 * Check if location is valid
 * @param {Array} location - [lng, lat]
 * @returns {boolean}
 */
export function isValidLocation(location) {
  if (!Array.isArray(location) || location.length !== 2) {
    return false;
  }
  const [lng, lat] = location;
  return (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/**
 * Get current position from browser geolocation API
 * @returns {Promise<Array>} [lng, lat]
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.longitude, position.coords.latitude]);
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Watch position changes
 * @param {Function} callback - Called with [lng, lat] on position update
 * @param {Function} errorCallback - Called on error
 * @returns {number} Watch ID to use with clearWatch
 */
export function watchPosition(callback, errorCallback) {
  if (!navigator.geolocation) {
    errorCallback?.(new Error('Geolocation is not supported'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback([position.coords.longitude, position.coords.latitude]);
    },
    (error) => {
      errorCallback?.(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

/**
 * Stop watching position
 * @param {number} watchId - ID returned by watchPosition
 */
export function clearWatch(watchId) {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}
