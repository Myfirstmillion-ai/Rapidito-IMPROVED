/**
 * LOW-003: Application Constants
 * Centralized configuration for magic numbers and repeated values
 */

module.exports = {
  // Authentication
  AUTH: {
    BCRYPT_ROUNDS: 10,
    JWT_EXPIRY: '24h',
    TOKEN_BLACKLIST_EXPIRY: 86400, // 24 hours in seconds
    EMAIL_VERIFICATION_EXPIRY: '15m',
    PASSWORD_RESET_EXPIRY: '15m',
  },

  // Rate Limiting
  RATE_LIMIT: {
    GENERAL: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100,
    },
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 5,
    },
    RIDE_CREATION: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX_REQUESTS: 5,
    },
  },

  // OTP
  OTP: {
    LENGTH: 6,
    EXPIRY_MINUTES: 10,
  },

  // Ride
  RIDE: {
    STATUSES: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
    VEHICLE_TYPES: ['car', 'bike'],
    SEARCH_RADIUS_KM: 4,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // Timeouts
  TIMEOUTS: {
    EXTERNAL_API_MS: 10000, // 10 seconds
    MONGODB_SERVER_SELECTION_MS: 5000,
    MONGODB_SOCKET_MS: 45000,
  },

  // MongoDB
  MONGODB: {
    MAX_POOL_SIZE: 10,
    RETRY_ATTEMPTS: 5,
    RETRY_DELAY_MS: 5000,
  },

  // Input Limits
  INPUT_LIMITS: {
    JSON_SIZE: '10kb',
    PASSWORD_MIN_LENGTH: 8,
    COMMENT_MAX_LENGTH: 250,
  },

  // Geolocation
  GEO: {
    DEFAULT_LOCATION: {
      lat: 7.8146,
      lng: -72.4430, // San Antonio del Táchira
    },
    COORDINATE_BOUNDS: {
      LAT_MIN: -90,
      LAT_MAX: 90,
      LNG_MIN: -180,
      LNG_MAX: 180,
    },
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE_MB: 5,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
};
