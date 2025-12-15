const axios = require("axios");
const captainModel = require("../models/captain.model");
const serviceArea = require("../config/serviceArea");

// PERF-004: In-memory cache for geocoding results to reduce API calls by ~70%
const NodeCache = require('node-cache');
const geoCache = new NodeCache({ 
  stdTTL: 3600,      // 1 hour default TTL
  checkperiod: 600,  // Check for expired keys every 10 minutes
  useClones: false   // Better performance - don't clone objects
});

// Cache statistics logging (optional - for monitoring)
let cacheHits = 0;
let cacheMisses = 0;

// GOOGLE MAPS API CONFIGURATION
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn("⚠️ GOOGLE_MAPS_API_KEY not found in environment variables. Map services will not work.");
}

// Google Maps API base URLs
const GOOGLE_MAPS_API = {
  geocoding: 'https://maps.googleapis.com/maps/api/geocode/json',
  directions: 'https://maps.googleapis.com/maps/api/directions/json',
  distanceMatrix: 'https://maps.googleapis.com/maps/api/distancematrix/json',
  placeAutocomplete: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
  placeDetails: 'https://maps.googleapis.com/maps/api/place/details/json'
};

// Common parameters for all Google Maps API requests
const COMMON_PARAMS = {
  key: GOOGLE_MAPS_API_KEY,
  language: 'es',
  region: 've' // Bias to Venezuela
};

/**
 * Get coordinates from address using Google Geocoding API
 * PERF-004: Implements caching to reduce API calls by ~70%
 * @param {string} address - Address to geocode
 * @returns {Promise<{lat: number, lng: number}>} Coordinates
 */
module.exports.getAddressCoordinate = async (address) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY no configurado");
  }

  // PERF-004: Check cache first
  const cacheKey = `geo:${address.toLowerCase().trim()}`;
  const cached = geoCache.get(cacheKey);
  if (cached) {
    cacheHits++;
    return cached;
  }
  cacheMisses++;

  try {
    const response = await axios.get(GOOGLE_MAPS_API.geocoding, {
      params: {
        ...COMMON_PARAMS,
        address: address,
        components: 'country:ve|country:co' // Limit to Venezuela and Colombia
      },
      timeout: 10000 // HIGH-012: 10 second timeout for external API calls
    });

    if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      const formattedAddress = response.data.results[0].formatted_address;
      
      // Extract locality information for service area validation
      let locality = null;
      const addressComponents = response.data.results[0].address_components || [];
      for (const component of addressComponents) {
        if (component.types.includes('locality') || 
            component.types.includes('administrative_area_level_1') ||
            component.types.includes('administrative_area_level_2')) {
          locality = component.long_name;
          break;
        }
      }
      
      // Check if location is within service area
      if (!serviceArea.isWithinServiceArea(location.lat, location.lng, locality)) {
        throw new Error("Ubicación fuera del área de servicio");
      }
      
      const result = { 
        lat: location.lat, 
        lng: location.lng,
        formatted_address: formattedAddress
      };
      
      // PERF-004: Cache the result
      geoCache.set(cacheKey, result);
      
      return result;
    } else {
      throw new Error("No se pudieron obtener las coordenadas");
    }
  } catch (error) {
    console.error("Google geocoding error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get address from coordinates using Google Reverse Geocoding
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Formatted address
 */
module.exports.getAddressFromCoordinates = async (lat, lng) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY no configurado");
  }

  // Check if coordinates are within service area
  if (!serviceArea.isWithinBounds(lat, lng)) {
    throw new Error("Ubicación fuera del área de servicio");
  }

  try {
    const response = await axios.get(GOOGLE_MAPS_API.geocoding, {
      params: {
        ...COMMON_PARAMS,
        latlng: `${lat},${lng}`
      },
      timeout: 10000 // HIGH-012: 10 second timeout for external API calls
    });

    if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      
      // Extract locality information
      let locality = null;
      const addressComponents = result.address_components || [];
      for (const component of addressComponents) {
        if (component.types.includes('locality') || 
            component.types.includes('administrative_area_level_1') ||
            component.types.includes('administrative_area_level_2')) {
          locality = component.long_name;
          break;
        }
      }
      
      // Secondary validation with locality name
      if (locality && !serviceArea.isAllowedLocality(locality)) {
        throw new Error("Ubicación fuera del área de servicio");
      }
      
      return result.formatted_address;
    } else {
      throw new Error("No se pudo obtener la dirección");
    }
  } catch (error) {
    console.error("Google reverse geocoding error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get distance and time between two locations using Google Directions API
 * @param {string} origin - Origin address
 * @param {string} destination - Destination address
 * @returns {Promise<{distance: {value: number, text: string}, duration: {value: number, text: string}, route: object}>}
 */
module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origen y destino son requeridos");
  }
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY no configurado");
  }

  try {
    // First, geocode both addresses to get coordinates
    const originCoords = await module.exports.getAddressCoordinate(origin);
    const destCoords = await module.exports.getAddressCoordinate(destination);

    // Use Google Directions API for driving route
    const response = await axios.get(GOOGLE_MAPS_API.directions, {
      params: {
        ...COMMON_PARAMS,
        origin: `${originCoords.lat},${originCoords.lng}`,
        destination: `${destCoords.lat},${destCoords.lng}`,
        mode: 'driving',
        alternatives: false,
        optimize: true
      },
      timeout: 10000 // HIGH-012: 10 second timeout for external API calls
    });

    if (response.data.status === 'OK' && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      // Format the response to match the previous API format
      return {
        distance: {
          value: leg.distance.value, // meters
          text: leg.distance.text
        },
        duration: {
          value: leg.duration.value, // seconds
          text: leg.duration.text
        },
        route: {
          geometry: route.overview_polyline,
          steps: leg.steps
        }
      };
    } else {
      throw new Error("No se encontraron rutas");
    }
  } catch (err) {
    console.error("Google directions error:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Get autocomplete suggestions using Google Places Autocomplete API
 * PERF-004: Implements caching to reduce API calls
 * @param {string} input - Search query
 * @returns {Promise<string[]>} Array of place suggestions
 */
module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("La consulta es requerida");
  }

  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY no configurado");
  }

  // PERF-004: Check cache first (shorter TTL for suggestions - 30 min)
  const cacheKey = `suggestions:${input.toLowerCase().trim()}`;
  const cached = geoCache.get(cacheKey);
  if (cached) {
    cacheHits++;
    return cached;
  }
  cacheMisses++;

  try {
    const response = await axios.get(GOOGLE_MAPS_API.placeAutocomplete, {
      params: {
        ...COMMON_PARAMS,
        input: input,
        components: 'country:ve|country:co',
        location: `${serviceArea.SERVICE_AREA_CENTER.lat},${serviceArea.SERVICE_AREA_CENTER.lng}`,
        radius: serviceArea.SERVICE_AREA_CENTER.radiusMeters,
        strictbounds: true,
        types: 'geocode|establishment'
      },
      timeout: 10000 // HIGH-012: 10 second timeout for external API calls
    });

    if (response.data.status === 'OK' && response.data.predictions && response.data.predictions.length > 0) {
      // Filter results to only include locations within service area cities
      const predictions = response.data.predictions;
      const filteredPredictions = predictions.filter(prediction => {
        const description = prediction.description.toLowerCase();
        return serviceArea.ALLOWED_LOCALITIES.venezuela.some(city => 
          description.includes(city.toLowerCase())
        ) || serviceArea.ALLOWED_LOCALITIES.colombia.some(city => 
          description.includes(city.toLowerCase())
        );
      });

      const result = filteredPredictions.map(prediction => prediction.description);
      
      // PERF-004: Cache suggestions with shorter TTL (30 min)
      geoCache.set(cacheKey, result, 1800);
      
      return result;
    } else {
      return [];
    }
  } catch (err) {
    console.log("Google autocomplete error:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Calculate distance between multiple origins and destinations
 * @param {Array} origins - Array of origin coordinates [{lat, lng}]
 * @param {Array} destinations - Array of destination coordinates [{lat, lng}]
 * @returns {Promise<Object>} Distance matrix result
 */
module.exports.calculateDistance = async (origins, destinations) => {
  if (!origins || !destinations || !origins.length || !destinations.length) {
    throw new Error("Orígenes y destinos son requeridos");
  }

  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY no configurado");
  }

  // Format origins and destinations as strings
  const originsStr = origins.map(coord => `${coord.lat},${coord.lng}`).join('|');
  const destinationsStr = destinations.map(coord => `${coord.lat},${coord.lng}`).join('|');

  try {
    const response = await axios.get(GOOGLE_MAPS_API.distanceMatrix, {
      params: {
        ...COMMON_PARAMS,
        origins: originsStr,
        destinations: destinationsStr,
        mode: 'driving',
        units: 'metric'
      },
      timeout: 10000 // HIGH-012: 10 second timeout for external API calls
    });

    if (response.data.status === 'OK') {
      return response.data;
    } else {
      throw new Error(`Error en Distance Matrix API: ${response.data.status}`);
    }
  } catch (error) {
    console.error("Google Distance Matrix error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get captains within radius using MongoDB geospatial query
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Radius in kilometers
 * @param {string} vehicleType - Vehicle type filter
 * @returns {Promise<Array>} Array of captain documents
 */
module.exports.getCaptainsInTheRadius = async (lat, lng, radius, vehicleType) => {
  // Check if location is within service area
  if (!serviceArea.isWithinBounds(lat, lng)) {
    console.warn("Pickup location is outside service area, but continuing search for captains");
  }
  
  try {
    const captains = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius / 6371],
        },
      },
      "vehicle.type": vehicleType,
    });
    return captains;
  } catch (error) {
    throw new Error("Error obteniendo conductores en el radio: " + error.message);
  }
};

/**
 * Get route between origin and destination
 * @param {Object} origin - Origin coordinates {lat, lng}
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @returns {Promise<Object>} Route details including polyline and steps
 */
module.exports.getRoute = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origen y destino son requeridos");
  }
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY no configurado");
  }

  try {
    const response = await axios.get(GOOGLE_MAPS_API.directions, {
      params: {
        ...COMMON_PARAMS,
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: 'driving',
        alternatives: false
      },
      timeout: 10000 // HIGH-012: 10 second timeout for external API calls
    });

    if (response.data.status === 'OK' && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      return {
        polyline: route.overview_polyline.points,
        distance: leg.distance.value, // meters
        duration: leg.duration.value, // seconds
        steps: leg.steps.map(step => ({
          distance: step.distance.value,
          duration: step.duration.value,
          instructions: step.html_instructions,
          polyline: step.polyline.points,
          start_location: step.start_location,
          end_location: step.end_location
        }))
      };
    } else {
      throw new Error("No se encontraron rutas");
    }
  } catch (err) {
    console.error("Google directions error:", err.response?.data || err.message);
    throw err;
  }
};
