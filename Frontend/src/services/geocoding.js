const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_API_BASE = 'https://api.mapbox.com';

/**
 * Search for locations using Mapbox Geocoding API
 * @param {string} query - Search query
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Array of location suggestions
 */
export async function searchLocations(query, options = {}) {
  if (!query || query.length < 3) {
    return [];
  }

  const {
    proximity = null, // [lng, lat] for biased results
    limit = 5,
    types = 'place,address,poi', // Types of results to return
    country = null, // ISO 3166-1 alpha-2 country code
  } = options;

  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      limit: limit.toString(),
      types,
    });

    if (proximity) {
      params.append('proximity', proximity.join(','));
    }

    if (country) {
      params.append('country', country);
    }

    const response = await fetch(
      `${MAPBOX_API_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    
    return data.features.map(feature => ({
      id: feature.id,
      place_name: feature.place_name,
      text: feature.text,
      coordinates: feature.geometry.coordinates, // [lng, lat]
      center: feature.center,
      place_type: feature.place_type,
      context: feature.context,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

/**
 * Reverse geocode coordinates to get location details
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {Promise<Object|null>} Location details
 */
export async function reverseGeocode(lng, lat) {
  try {
    const response = await fetch(
      `${MAPBOX_API_BASE}/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        id: feature.id,
        place_name: feature.place_name,
        text: feature.text,
        coordinates: feature.geometry.coordinates,
        center: feature.center,
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Get route directions between two points
 * @param {Array} origin - [lng, lat] of origin
 * @param {Array} destination - [lng, lat] of destination
 * @returns {Promise<Object|null>} Route details
 */
export async function getDirections(origin, destination) {
  try {
    const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
    
    const response = await fetch(
      `${MAPBOX_API_BASE}/directions/v5/mapbox/driving/${coordinates}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`
    );

    if (!response.ok) {
      throw new Error('Directions request failed');
    }

    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        geometry: route.geometry,
      };
    }

    return null;
  } catch (error) {
    console.error('Directions error:', error);
    return null;
  }
}
