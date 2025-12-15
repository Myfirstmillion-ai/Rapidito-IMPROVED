import { Star } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Star Rating Display Component (Read-only)
 * Shows rating average with stars
 * 
 * @param {Object} props
 * @param {number} props.average - Average rating (0-5)
 * @param {number} props.count - Number of ratings
 * @param {number} props.size - Star size in pixels (default: 16)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showCount - Show rating count (default: true)
 */
function StarRating({ average = 0, count = 0, size = 16, className, showCount = true }) {
  if (count === 0) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className="text-xs font-medium text-gray-500">Sin calificaciones</span>
      </div>
    );
  }

  const fullStars = Math.floor(average);
  const hasHalfStar = average % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={size}
            className="text-yellow-500 fill-yellow-500"
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative inline-block">
            <Star size={size} className="text-gray-300 fill-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={size} className="text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={size}
            className="text-gray-300 fill-gray-300"
          />
        ))}
      </div>
      
      <span className="text-sm font-semibold text-gray-700">
        {average.toFixed(1)}
      </span>
      
      {showCount && (
        <span className="text-xs text-gray-500">
          ({count})
        </span>
      )}
    </div>
  );
}

export default StarRating;
