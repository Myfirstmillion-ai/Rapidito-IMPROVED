/**
 * Persistence Manager
 * 
 * Handles state persistence across page reloads for critical app data:
 * - Active ride state
 * - User authentication
 * - UI preferences
 * 
 * Uses localStorage with proper validation, expiration, and conflict resolution
 */

// Storage keys
const STORAGE_KEYS = {
  ACTIVE_RIDE: 'rapidito_active_ride',
  AUTH_TOKEN: 'rapidito_auth_token',
  USER_DATA: 'rapidito_user_data',
  MAP_STATE: 'rapidito_map_state',
  FAVORITES: 'rapidito_favorites',
  INSTALL_PROMPT_DISMISSED: 'rapidito_install_prompt_dismissed'
};

// Maximum age for stored data (in milliseconds)
const MAX_AGE = {
  RIDE: 24 * 60 * 60 * 1000, // 24 hours
  AUTH: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAP: 30 * 24 * 60 * 60 * 1000, // 30 days
  FAVORITES: 365 * 24 * 60 * 60 * 1000 // 1 year
};

/**
 * Base persistence functions
 */
const basePersistence = {
  /**
   * Save data to localStorage with timestamp
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   */
  save: (key, data) => {
    try {
      const storageItem = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(storageItem));
    } catch (error) {
      console.error(`Error saving to localStorage: ${error.message}`);
    }
  },

  /**
   * Load data from localStorage with age validation
   * @param {string} key - Storage key
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {any|null} The stored data or null if expired/invalid
   */
  load: (key, maxAge) => {
    try {
      const storedItem = localStorage.getItem(key);
      if (!storedItem) return null;

      const { data, timestamp } = JSON.parse(storedItem);
      const age = Date.now() - timestamp;

      // Check if data is too old
      if (maxAge && age > maxAge) {
        localStorage.removeItem(key); // Clean up expired data
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error loading from localStorage: ${error.message}`);
      return null;
    }
  },

  /**
   * Clear specific data from localStorage
   * @param {string} key - Storage key
   */
  clear: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing localStorage: ${error.message}`);
    }
  }
};

/**
 * Ride state persistence manager
 */
export const ridePersistence = {
  /**
   * Save active ride state
   * @param {Object} rideData - Ride data to persist
   */
  saveRideState: (rideData) => {
    if (!rideData || !rideData.rideId) {
      console.error("Invalid ride data for persistence");
      return;
    }

    // Only save essential data to minimize storage size
    const persistentData = {
      rideId: rideData.rideId,
      status: rideData.status,
      pickup: rideData.pickup,
      destination: rideData.destination,
      captain: rideData.captain ? {
        _id: rideData.captain._id,
        fullname: rideData.captain.fullname,
        phone: rideData.captain.phone,
        profileImage: rideData.captain.profileImage,
        rating: rideData.captain.rating,
        vehicle: rideData.captain.vehicle,
        socketId: rideData.captain.socketId
      } : null,
      user: rideData.user ? {
        _id: rideData.user._id,
        fullname: rideData.user.fullname,
        phone: rideData.user.phone,
        profileImage: rideData.user.profileImage
      } : null,
      createdAt: rideData.createdAt,
      fare: rideData.fare,
      paymentMethod: rideData.paymentMethod,
      vehicleType: rideData.vehicleType
    };

    basePersistence.save(STORAGE_KEYS.ACTIVE_RIDE, persistentData);
  },

  /**
   * Load active ride state
   * @returns {Object|null} The stored ride data or null
   */
  loadRideState: () => {
    return basePersistence.load(STORAGE_KEYS.ACTIVE_RIDE, MAX_AGE.RIDE);
  },

  /**
   * Clear active ride state
   */
  clearRideState: () => {
    basePersistence.clear(STORAGE_KEYS.ACTIVE_RIDE);
  }
};

/**
 * Auth state persistence manager
 */
export const authPersistence = {
  /**
   * Save authentication data
   * @param {Object} authData - Authentication data
   */
  saveAuthState: (authData) => {
    if (!authData || !authData.token) {
      console.error("Invalid auth data for persistence");
      return;
    }

    basePersistence.save(STORAGE_KEYS.AUTH_TOKEN, authData.token);
    
    // Store user data separately (without sensitive info)
    if (authData.user) {
      const userData = { ...authData.user };
      // Remove sensitive fields if present
      delete userData.password;
      delete userData.otp;
      
      basePersistence.save(STORAGE_KEYS.USER_DATA, userData);
    }
  },

  /**
   * Load authentication state
   * @returns {Object|null} Authentication state or null
   */
  loadAuthState: () => {
    const token = basePersistence.load(STORAGE_KEYS.AUTH_TOKEN, MAX_AGE.AUTH);
    const user = basePersistence.load(STORAGE_KEYS.USER_DATA, MAX_AGE.AUTH);
    
    if (!token) return null;
    
    return {
      token,
      user
    };
  },

  /**
   * Clear authentication state (logout)
   */
  clearAuthState: () => {
    basePersistence.clear(STORAGE_KEYS.AUTH_TOKEN);
    basePersistence.clear(STORAGE_KEYS.USER_DATA);
  }
};

/**
 * UI state persistence manager
 */
export const uiPersistence = {
  /**
   * Save map state
   * @param {Object} mapState - Map state to persist
   * @param {boolean} [userInitiated=true] - Whether the state change was user-initiated
   */
  saveMapState: (mapState, userInitiated = true) => {
    // Only save if user manually moved the map or explicitly requested
    if (!userInitiated) return;
    
    if (!mapState || !mapState.center || !mapState.zoom) {
      console.error("Invalid map state for persistence");
      return;
    }

    basePersistence.save(STORAGE_KEYS.MAP_STATE, mapState);
  },

  /**
   * Load map state
   * @returns {Object|null} The stored map state or null
   */
  loadMapState: () => {
    return basePersistence.load(STORAGE_KEYS.MAP_STATE, MAX_AGE.MAP);
  },

  /**
   * Save favorite locations
   * @param {Array} favorites - Array of favorite locations
   */
  saveFavorites: (favorites) => {
    if (!Array.isArray(favorites)) {
      console.error("Invalid favorites data for persistence");
      return;
    }

    basePersistence.save(STORAGE_KEYS.FAVORITES, favorites);
  },

  /**
   * Load favorite locations
   * @returns {Array|null} The stored favorites or null
   */
  loadFavorites: () => {
    return basePersistence.load(STORAGE_KEYS.FAVORITES, MAX_AGE.FAVORITES);
  },

  /**
   * Save PWA install prompt dismissal state
   * @param {boolean} dismissed - Whether the prompt was dismissed
   */
  saveInstallPromptDismissed: (dismissed) => {
    basePersistence.save(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED, dismissed);
  },

  /**
   * Check if PWA install prompt was dismissed
   * @returns {boolean} Whether the prompt was dismissed
   */
  wasInstallPromptDismissed: () => {
    return basePersistence.load(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED, null) || false;
  }
};

// Export default object with all managers
export default {
  ride: ridePersistence,
  auth: authPersistence,
  ui: uiPersistence,
  
  // Helper to clear all persistence data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      basePersistence.clear(key);
    });
  }
};
