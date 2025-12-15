/**
 * Service Area Configuration for Rapi-dito
 * 
 * Defines the geographical areas where the service is available:
 * - Venezuela (Táchira)
 * - Colombia (Norte de Santander)
 */

// Bounding box for the entire service area
const SERVICE_AREA_BOUNDS = {
  north: 8.0,   // North limit (approx. north of Cúcuta)
  south: 7.5,   // South limit (approx. south of Rubio)
  east: -72.2,  // East limit
  west: -72.6   // West limit (approx. west of San Cristóbal)
};

// List of allowed municipalities/localities
const ALLOWED_LOCALITIES = {
  venezuela: [
    "San Antonio del Táchira",
    "San Antonio",
    "Llano de Jorge",
    "La Sabana",
    "Sabana Potrera",
    "Brisas",
    "Rubio",
    "San Cristóbal",
    "Palotal",
    "Ureña"
  ],
  colombia: [
    "Cúcuta",
    "Cucuta",
    "Villa del Rosario",
    "Los Patios",
    "Tienditas",
    "El Escobal",
    "La Parada"
  ]
};

// All localities in a single array for filtering
const ALL_ALLOWED_LOCALITIES = [
  ...ALLOWED_LOCALITIES.venezuela,
  ...ALLOWED_LOCALITIES.colombia
];

/**
 * Checks if coordinates are within the service area bounding box
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - Whether the location is within bounds
 */
function isWithinBounds(lat, lng) {
  return (
    lat >= SERVICE_AREA_BOUNDS.south &&
    lat <= SERVICE_AREA_BOUNDS.north &&
    lng >= SERVICE_AREA_BOUNDS.west &&
    lng <= SERVICE_AREA_BOUNDS.east
  );
}

/**
 * Checks if a locality name is in the allowed list
 * @param {string} localityName - Name of the locality to check
 * @returns {boolean} - Whether the locality is allowed
 */
function isAllowedLocality(localityName) {
  if (!localityName) return false;
  
  const normalizedName = localityName.toLowerCase().trim();
  
  return ALL_ALLOWED_LOCALITIES.some(locality => 
    normalizedName.includes(locality.toLowerCase())
  );
}

/**
 * Checks if a location is within the service area
 * Based on both coordinates and locality name
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} [localityName] - Optional locality name for additional validation
 * @returns {boolean} - Whether the location is within the service area
 */
function isWithinServiceArea(lat, lng, localityName = null) {
  // First check the bounding box (fast check)
  const withinBounds = isWithinBounds(lat, lng);
  
  // If not in bounding box, reject immediately
  if (!withinBounds) return false;
  
  // If we have a locality name, validate against the allowed list
  if (localityName) {
    return isAllowedLocality(localityName);
  }
  
  // If we only have coordinates, rely on the bounding box check
  return true;
}

// Geographic center of service area for bias in API calls
const SERVICE_AREA_CENTER = {
  lat: 7.7,
  lng: -72.4,
  radiusMeters: 50000 // 50km radius
};

// Export all utilities and constants
module.exports = {
  SERVICE_AREA_BOUNDS,
  ALLOWED_LOCALITIES,
  SERVICE_AREA_CENTER,
  isWithinBounds,
  isAllowedLocality,
  isWithinServiceArea
};
