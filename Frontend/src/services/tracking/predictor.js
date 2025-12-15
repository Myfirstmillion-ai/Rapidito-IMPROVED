/**
 * Location Predictor - Predict next position based on velocity
 * Uses historical positions to estimate future location
 */

/**
 * Calculate velocity from position history
 * @param {Array} positions - Array of {lat, lng, timestamp} objects
 * @returns {Object} Velocity in {latPerMs, lngPerMs, speedKmh, heading}
 */
export function calculateVelocity(positions) {
  if (!positions || positions.length < 2) {
    return { latPerMs: 0, lngPerMs: 0, speedKmh: 0, heading: 0 };
  }

  // Use last two positions for velocity calculation
  const recent = positions.slice(-2);
  const [prev, curr] = recent;
  
  const timeDiff = curr.timestamp - prev.timestamp;
  if (timeDiff <= 0) {
    return { latPerMs: 0, lngPerMs: 0, speedKmh: 0, heading: curr.heading || 0 };
  }

  const latDiff = curr.lat - prev.lat;
  const lngDiff = curr.lng - prev.lng;

  // Calculate speed in km/h
  const distanceKm = haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  const timeHours = timeDiff / (1000 * 60 * 60);
  const speedKmh = distanceKm / timeHours;

  // Calculate heading
  const heading = calculateBearing(prev.lat, prev.lng, curr.lat, curr.lng);

  return {
    latPerMs: latDiff / timeDiff,
    lngPerMs: lngDiff / timeDiff,
    speedKmh: Math.min(speedKmh, 200), // Cap at 200 km/h for sanity
    heading,
  };
}

/**
 * Haversine distance between two points
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} Distance in km
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate bearing between two points
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} Bearing in degrees (0-360)
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Predict next position based on velocity
 * @param {Object} currentPosition - Current {lat, lng, timestamp}
 * @param {Object} velocity - Velocity from calculateVelocity
 * @param {number} predictMs - How far ahead to predict (ms)
 * @returns {Object} Predicted position {lat, lng, heading}
 */
export function predictPosition(currentPosition, velocity, predictMs = 1000) {
  if (!velocity || (velocity.latPerMs === 0 && velocity.lngPerMs === 0)) {
    return {
      lat: currentPosition.lat,
      lng: currentPosition.lng,
      heading: currentPosition.heading || velocity?.heading || 0,
    };
  }

  return {
    lat: currentPosition.lat + velocity.latPerMs * predictMs,
    lng: currentPosition.lng + velocity.lngPerMs * predictMs,
    heading: velocity.heading,
  };
}

/**
 * Weighted average prediction using multiple historical points
 * More recent points have higher weight
 * @param {Array} positions - Array of {lat, lng, timestamp} objects (3-5 recommended)
 * @param {number} predictMs - How far ahead to predict
 * @returns {Object} Predicted position
 */
export function weightedPrediction(positions, predictMs = 1000) {
  if (!positions || positions.length < 2) {
    return positions?.[0] || { lat: 0, lng: 0, heading: 0 };
  }

  // Calculate velocities between consecutive points
  const velocities = [];
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const timeDiff = curr.timestamp - prev.timestamp;
    
    if (timeDiff > 0) {
      velocities.push({
        latPerMs: (curr.lat - prev.lat) / timeDiff,
        lngPerMs: (curr.lng - prev.lng) / timeDiff,
        weight: i, // More recent = higher weight
      });
    }
  }

  if (velocities.length === 0) {
    return positions[positions.length - 1];
  }

  // Calculate weighted average velocity
  let totalWeight = 0;
  let avgLatPerMs = 0;
  let avgLngPerMs = 0;

  for (const v of velocities) {
    avgLatPerMs += v.latPerMs * v.weight;
    avgLngPerMs += v.lngPerMs * v.weight;
    totalWeight += v.weight;
  }

  avgLatPerMs /= totalWeight;
  avgLngPerMs /= totalWeight;

  const lastPosition = positions[positions.length - 1];
  const heading = calculateBearing(
    positions[positions.length - 2].lat,
    positions[positions.length - 2].lng,
    lastPosition.lat,
    lastPosition.lng
  );

  return {
    lat: lastPosition.lat + avgLatPerMs * predictMs,
    lng: lastPosition.lng + avgLngPerMs * predictMs,
    heading,
  };
}

/**
 * Create a position predictor instance with history management
 * @param {number} historySize - Number of positions to keep
 * @returns {Object} Predictor instance
 */
export function createPredictor(historySize = 5) {
  const history = [];

  return {
    /**
     * Add a new position to history
     * @param {Object} position - {lat, lng, timestamp, heading?}
     */
    addPosition(position) {
      history.push({
        lat: position.lat,
        lng: position.lng,
        timestamp: position.timestamp || Date.now(),
        heading: position.heading,
      });

      // Keep only recent positions
      while (history.length > historySize) {
        history.shift();
      }
    },

    /**
     * Get predicted position
     * @param {number} predictMs - How far ahead to predict
     * @returns {Object} Predicted position
     */
    predict(predictMs = 1000) {
      return weightedPrediction(history, predictMs);
    },

    /**
     * Get current velocity
     * @returns {Object} Current velocity
     */
    getVelocity() {
      return calculateVelocity(history);
    },

    /**
     * Get position history
     * @returns {Array} Position history
     */
    getHistory() {
      return [...history];
    },

    /**
     * Clear history
     */
    clear() {
      history.length = 0;
    },
  };
}

export default {
  calculateVelocity,
  predictPosition,
  weightedPrediction,
  createPredictor,
};
