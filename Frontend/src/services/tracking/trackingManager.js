/**
 * TrackingManager - Coordinates interpolation + prediction for smooth 60fps updates
 * Main class for professional real-time tracking like Uber
 */

import { animatePosition, interpolatePosition, interpolateHeading } from './interpolator';
import { createPredictor } from './predictor';

/**
 * TrackingManager class - handles smooth location updates
 */
export class TrackingManager {
  constructor(options = {}) {
    // Configuration
    this.animationDuration = options.animationDuration || 3000; // ms between updates
    this.predictionEnabled = options.predictionEnabled ?? true;
    this.onPositionUpdate = options.onPositionUpdate || (() => {});
    this.onETAUpdate = options.onETAUpdate || (() => {});
    this.onError = options.onError || console.error;

    // State
    this.currentPosition = null;
    this.targetPosition = null;
    this.currentHeading = 0;
    this.isAnimating = false;
    this.cancelAnimation = null;
    this.predictor = createPredictor(5);
    this.lastUpdateTime = 0;
    this.eta = null;
    this.distance = null;
    this.speed = 0;

    // Animation frame for prediction
    this.predictionFrameId = null;
    this.isRunning = false;
  }

  /**
   * Start the tracking manager
   */
  start() {
    this.isRunning = true;
    if (this.predictionEnabled) {
      this.startPredictionLoop();
    }
  }

  /**
   * Stop the tracking manager
   */
  stop() {
    this.isRunning = false;
    this.cancelCurrentAnimation();
    if (this.predictionFrameId) {
      cancelAnimationFrame(this.predictionFrameId);
      this.predictionFrameId = null;
    }
  }

  /**
   * Update with new location from server
   * @param {Object} locationData - {lat, lng, heading, speed, eta, distance, timestamp}
   */
  updateLocation(locationData) {
    const { lat, lng, heading, speed, eta, distance, timestamp } = locationData;

    // Validate coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      this.onError('Invalid location data received');
      return;
    }

    const newPosition = { lat, lng, heading: heading || this.currentHeading };
    const now = timestamp || Date.now();

    // Add to predictor history
    this.predictor.addPosition({ lat, lng, timestamp: now, heading });

    // Update metadata
    this.speed = speed || 0;
    this.eta = eta;
    this.distance = distance;
    this.lastUpdateTime = now;

    // Notify ETA update
    if (eta !== undefined) {
      this.onETAUpdate({ eta, distance, speed: this.speed });
    }

    // If this is the first position, set immediately
    if (!this.currentPosition) {
      this.currentPosition = newPosition;
      this.currentHeading = heading || 0;
      this.onPositionUpdate({
        ...newPosition,
        isInitial: true,
      });
      return;
    }

    // Set target and start animation
    this.targetPosition = newPosition;
    this.animateToTarget();
  }

  /**
   * Animate from current position to target
   */
  animateToTarget() {
    if (!this.targetPosition || !this.currentPosition) return;

    // Cancel any existing animation
    this.cancelCurrentAnimation();

    const from = { ...this.currentPosition };
    const to = { ...this.targetPosition };

    this.isAnimating = true;

    this.cancelAnimation = animatePosition(
      from,
      to,
      this.animationDuration,
      // onUpdate - called every frame
      (interpolated) => {
        this.currentPosition = {
          lat: interpolated.lat,
          lng: interpolated.lng,
        };
        this.currentHeading = interpolated.heading || this.currentHeading;

        this.onPositionUpdate({
          lat: interpolated.lat,
          lng: interpolated.lng,
          heading: this.currentHeading,
          isAnimating: true,
        });
      },
      // onComplete
      () => {
        this.isAnimating = false;
        this.currentPosition = { ...to };
        this.currentHeading = to.heading || this.currentHeading;
      }
    );
  }

  /**
   * Cancel current animation
   */
  cancelCurrentAnimation() {
    if (this.cancelAnimation) {
      this.cancelAnimation();
      this.cancelAnimation = null;
    }
    this.isAnimating = false;
  }

  /**
   * Start prediction loop for smooth updates between server events
   */
  startPredictionLoop() {
    const predict = () => {
      if (!this.isRunning) return;

      // Only predict if we're not currently animating and have history
      if (!this.isAnimating && this.currentPosition && this.predictor.getHistory().length >= 2) {
        const timeSinceUpdate = Date.now() - this.lastUpdateTime;
        
        // Only predict if it's been a while since last update (server lag)
        if (timeSinceUpdate > this.animationDuration * 0.8) {
          const predicted = this.predictor.predict(100); // Predict 100ms ahead
          
          if (predicted) {
            // Smoothly move towards predicted position
            const t = Math.min(timeSinceUpdate / (this.animationDuration * 2), 0.3);
            const smoothed = interpolatePosition(this.currentPosition, predicted, t, 'easeOut');
            
            this.currentPosition = smoothed;
            this.currentHeading = interpolateHeading(
              this.currentHeading,
              predicted.heading || this.currentHeading,
              t
            );

            this.onPositionUpdate({
              ...smoothed,
              heading: this.currentHeading,
              isPredicted: true,
            });
          }
        }
      }

      this.predictionFrameId = requestAnimationFrame(predict);
    };

    this.predictionFrameId = requestAnimationFrame(predict);
  }

  /**
   * Get current state
   * @returns {Object} Current tracking state
   */
  getState() {
    return {
      position: this.currentPosition,
      heading: this.currentHeading,
      speed: this.speed,
      eta: this.eta,
      distance: this.distance,
      isAnimating: this.isAnimating,
      lastUpdateTime: this.lastUpdateTime,
    };
  }

  /**
   * Reset the tracking manager
   */
  reset() {
    this.cancelCurrentAnimation();
    this.currentPosition = null;
    this.targetPosition = null;
    this.currentHeading = 0;
    this.eta = null;
    this.distance = null;
    this.speed = 0;
    this.predictor.clear();
    this.lastUpdateTime = 0;
  }

  /**
   * Cleanup - call when component unmounts
   */
  destroy() {
    this.stop();
    this.reset();
  }
}

/**
 * Create a tracking manager instance
 * @param {Object} options - Configuration options
 * @returns {TrackingManager} Tracking manager instance
 */
export function createTrackingManager(options = {}) {
  return new TrackingManager(options);
}

/**
 * React hook for using tracking manager
 * Usage: const { position, eta, updateLocation } = useTrackingManager(options)
 */
export function useTrackingManagerSetup(options = {}) {
  const manager = new TrackingManager(options);
  
  return {
    manager,
    start: () => manager.start(),
    stop: () => manager.stop(),
    updateLocation: (data) => manager.updateLocation(data),
    getState: () => manager.getState(),
    reset: () => manager.reset(),
    destroy: () => manager.destroy(),
  };
}

export default TrackingManager;
