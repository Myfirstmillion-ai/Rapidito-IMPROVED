/**
 * Location Interpolator - Smooth movement between GPS points
 * Uses linear interpolation (LERP) for fluid animations
 */

/**
 * Linear interpolation between two values
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} t - Progress (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Ease-out cubic function for smoother deceleration
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased progress
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease-in-out cubic for smooth start and end
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased progress
 */
export function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Interpolate between two geographic positions
 * @param {Object} from - Starting position {lat, lng}
 * @param {Object} to - Ending position {lat, lng}
 * @param {number} t - Progress (0-1)
 * @param {string} easing - Easing function ('linear', 'easeOut', 'easeInOut')
 * @returns {Object} Interpolated position {lat, lng}
 */
export function interpolatePosition(from, to, t, easing = 'easeOut') {
  // Apply easing
  let easedT = t;
  switch (easing) {
    case 'easeOut':
      easedT = easeOutCubic(t);
      break;
    case 'easeInOut':
      easedT = easeInOutCubic(t);
      break;
    default:
      easedT = t;
  }

  return {
    lat: lerp(from.lat, to.lat, easedT),
    lng: lerp(from.lng, to.lng, easedT),
  };
}

/**
 * Interpolate heading (rotation) with shortest path
 * @param {number} from - Starting heading (0-360)
 * @param {number} to - Ending heading (0-360)
 * @param {number} t - Progress (0-1)
 * @returns {number} Interpolated heading
 */
export function interpolateHeading(from, to, t) {
  // Normalize angles
  from = ((from % 360) + 360) % 360;
  to = ((to % 360) + 360) % 360;

  // Find shortest rotation direction
  let diff = to - from;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  let result = from + diff * easeOutCubic(t);
  return ((result % 360) + 360) % 360;
}

/**
 * Create an animation sequence for smooth position updates
 * @param {Object} from - Starting position {lat, lng, heading}
 * @param {Object} to - Ending position {lat, lng, heading}
 * @param {number} duration - Animation duration in ms
 * @param {Function} onUpdate - Callback for each frame
 * @param {Function} onComplete - Callback when animation completes
 * @returns {Function} Cancel function
 */
export function animatePosition(from, to, duration, onUpdate, onComplete) {
  const startTime = performance.now();
  let animationId = null;
  let cancelled = false;

  function animate(currentTime) {
    if (cancelled) return;

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const interpolated = {
      lat: lerp(from.lat, to.lat, easeOutCubic(progress)),
      lng: lerp(from.lng, to.lng, easeOutCubic(progress)),
      heading: from.heading !== undefined && to.heading !== undefined
        ? interpolateHeading(from.heading, to.heading, progress)
        : to.heading,
    };

    onUpdate(interpolated);

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  }

  animationId = requestAnimationFrame(animate);

  // Return cancel function
  return () => {
    cancelled = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}

/**
 * Bezier curve interpolation for more natural movement
 * @param {Object} p0 - Start point
 * @param {Object} p1 - Control point 1
 * @param {Object} p2 - Control point 2
 * @param {Object} p3 - End point
 * @param {number} t - Progress (0-1)
 * @returns {Object} Point on curve
 */
export function cubicBezier(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  return {
    lat: mt3 * p0.lat + 3 * mt2 * t * p1.lat + 3 * mt * t2 * p2.lat + t3 * p3.lat,
    lng: mt3 * p0.lng + 3 * mt2 * t * p1.lng + 3 * mt * t2 * p2.lng + t3 * p3.lng,
  };
}

export default {
  lerp,
  easeOutCubic,
  easeInOutCubic,
  interpolatePosition,
  interpolateHeading,
  animatePosition,
  cubicBezier,
};
