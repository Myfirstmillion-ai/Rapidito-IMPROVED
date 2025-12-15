/**
 * Premium Fintech Skeleton Loader
 * Pulse animation for loading states - Revolut/Uber Pro style
 * Note: Uses Tailwind's animate-pulse for browser compatibility
 * For true shimmer effect, would need custom @keyframes
 */
function FintechSkeleton({ variant = "stat-card" }) {
  const variants = {
    "stat-card": (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-lg animate-pulse">
        <div className="h-3 bg-white/10 rounded w-24 mb-3"></div>
        <div className="h-8 bg-white/20 rounded w-16 mb-2"></div>
        <div className="h-2 bg-white/5 rounded w-12"></div>
      </div>
    ),
    "profile": (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-14 h-14 rounded-full bg-white/10"></div>
        <div className="flex-1">
          <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
          <div className="h-3 bg-white/5 rounded w-24"></div>
        </div>
      </div>
    ),
    "vehicle": (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-lg animate-pulse">
        <div className="h-3 bg-white/10 rounded w-20 mb-2"></div>
        <div className="h-5 bg-white/20 rounded w-24 mb-2"></div>
        <div className="flex gap-3">
          <div className="h-3 bg-white/5 rounded w-16"></div>
          <div className="h-3 bg-white/5 rounded w-12"></div>
        </div>
      </div>
    ),
  };

  return variants[variant] || variants["stat-card"];
}

/**
 * Dashboard Grid Skeleton - Full Bento Grid
 */
export function DashboardSkeleton() {
  return (
    <div className="px-4 pb-8 space-y-5">
      {/* Profile skeleton */}
      <FintechSkeleton variant="profile" />
      
      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        <FintechSkeleton variant="stat-card" />
        <FintechSkeleton variant="stat-card" />
        <FintechSkeleton variant="stat-card" />
        <FintechSkeleton variant="stat-card" />
        <FintechSkeleton variant="stat-card" />
        <FintechSkeleton variant="stat-card" />
      </div>
      
      {/* Vehicle skeleton */}
      <FintechSkeleton variant="vehicle" />
    </div>
  );
}

export default FintechSkeleton;
