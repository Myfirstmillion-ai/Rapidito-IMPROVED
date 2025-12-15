/**
 * Utility to decode Google Maps encoded polylines to GeoJSON format for Mapbox
 */

/**
 * Decodes an encoded polyline string into an array of coordinates
 * Algorithm from: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 * 
 * @param {string} encoded - The encoded polyline string from Google Maps API
 * @returns {Array} Array of [longitude, latitude] coordinates
 */
export function decodePolyline(encoded) {
  if (!encoded || encoded.length === 0) {
    return [];
  }
  
  const poly = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    // Note: Mapbox uses [longitude, latitude] format unlike Google's [latitude, longitude]
    poly.push([lng / 1e5, lat / 1e5]);
  }

  return poly;
}

/**
 * Converts a Google Maps encoded polyline to a GeoJSON LineString for Mapbox
 * 
 * @param {string} encodedPolyline - The encoded polyline from Google Maps API
 * @returns {Object} GeoJSON LineString object
 */
export function polylineToGeoJSON(encodedPolyline) {
  const coordinates = decodePolyline(encodedPolyline);
  
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    }
  };
}

/**
 * Converts a Google Maps routes response to a Mapbox-compatible route object
 * 
 * @param {Object} googleRoute - Google Maps Directions API response
 * @returns {Object} Mapbox-compatible route object
 */
export function convertGoogleRouteToMapbox(googleRoute) {
  if (!googleRoute || !googleRoute.routes || !googleRoute.routes.length) {
    return null;
  }
  
  const route = googleRoute.routes[0];
  const leg = route.legs[0];
  
  return {
    distance: leg.distance.value, // in meters
    duration: leg.duration.value, // in seconds
    geometry: polylineToGeoJSON(route.overview_polyline.points)
  };
}
