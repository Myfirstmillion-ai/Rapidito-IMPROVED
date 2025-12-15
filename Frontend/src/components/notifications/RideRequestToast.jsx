import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { DollarSign, Navigation, Radio } from "lucide-react";
import ErrorBoundary from "../ErrorBoundary";

// Z-index layering for proper stacking - CRITICAL: Must be above driver bottom sheet
const TOAST_Z_INDEX = 9999; // Supreme layer - above everything including driver panel and bottom sheet

/**
 * Premium iOS-Style Stacked Notification for Ride Requests
 * Dark Glassmorphism design positioned above the minimized driver bar
 * DEFENSIVE PROGRAMMING: All nested properties use optional chaining to prevent crashes
 */
function RideRequestToast({ ride, onAccept, onReject, toastId }) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject(); // Auto-reject when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReject]);

  // DEFENSIVE: Safely extract values with fallbacks
  const passengerFirstName = ride?.user?.fullname?.firstname || 'Usuario';
  const passengerLastName = ride?.user?.fullname?.lastname || '';
  const passengerRating = ride?.user?.rating?.average || ride?.user?.rating || null;
  const passengerProfileImage = ride?.user?.profileImage || null;
  const pickupAddress = ride?.pickup || 'Dirección no disponible';
  const destinationAddress = ride?.destination || 'Destino no disponible';
  const fareAmount = ride?.fare || 0;

  // Calculate distance to pickup (if available) - with defensive checks
  const distanceToPickup = ride?.distanceToPickup 
    ? `${(ride.distanceToPickup / 1000).toFixed(1)} km` 
    : ride?.distance 
      ? `${(ride.distance / 1000).toFixed(1)} km` 
      : null;

  const timeToPickup = ride?.durationToPickup 
    ? `${Math.ceil(ride.durationToPickup / 60)} min` 
    : ride?.duration 
      ? `${Math.ceil(ride.duration / 60)} min` 
      : null;

  return (
    <div className="flex flex-col gap-0 w-full max-w-[420px]">
      {/* Premium iOS-style notification pill with urgency glow */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden ring-1 ring-emerald-500/20">
        {/* Subtle top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
        
        {/* Header Strip - Nueva Solicitud */}
        <div className="px-4 pt-3 pb-2 border-b border-white/10">
          <div className="flex items-center justify-center gap-2">
            <Radio size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Nueva Solicitud de Viaje
            </span>
            <Radio size={14} className="text-emerald-400 animate-pulse" />
          </div>
        </div>
        
        {/* Main content */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* User Avatar - Left */}
            <div className="relative flex-shrink-0">
              {passengerProfileImage ? (
                <div className="relative">
                  <img
                    src={passengerProfileImage}
                    alt="Usuario"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-400/60 shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center ring-2 ring-emerald-400/60 shadow-lg hidden">
                    <span className="text-xl font-black text-white">
                      {passengerFirstName[0]}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center ring-2 ring-emerald-400/60 shadow-lg">
                  <span className="text-xl font-black text-white">
                    {passengerFirstName[0]}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-lg"></div>
            </div>

            {/* Passenger Name & Rating */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white truncate leading-tight">
                {passengerFirstName} {passengerLastName ? `${passengerLastName[0]}.` : ''}
              </h3>
              {passengerRating && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-yellow-400 text-sm">⭐</span>
                  <span className="text-sm font-semibold text-yellow-400">
                    {passengerRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Countdown - Right */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                transition-all duration-300
                ${countdown > 10 
                  ? 'bg-white/10 text-white' 
                  : 'bg-red-500/20 text-red-400 border-2 border-red-500/50 animate-pulse'}
              `}>
                {countdown}
              </div>
              <span className="text-[10px] text-white/40 mt-1 font-medium whitespace-nowrap">seg</span>
            </div>
          </div>

          {/* Price Badge - BIG & PROMINENT */}
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl px-4 py-3 border border-emerald-400/30 mb-3">
            <DollarSign size={28} className="text-emerald-400" />
            <span className="text-4xl font-black text-emerald-400">
              {fareAmount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Distance/Time to Pickup - If available */}
          {(distanceToPickup || timeToPickup) && (
            <div className="flex items-center justify-center gap-3 mb-3">
              {distanceToPickup && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Navigation size={14} className="text-cyan-400" />
                  <span className="text-sm font-bold text-white">{distanceToPickup}</span>
                </div>
              )}
              {timeToPickup && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-bold text-white">🕒 {timeToPickup}</span>
                </div>
              )}
            </div>
          )}

          {/* Location info - Compact */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/10">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Navigation size={12} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/50 font-semibold uppercase mb-0.5">Recogida</p>
                  <p className="text-sm text-white font-medium leading-tight" style={{ textWrap: 'balance' }}>
                    {pickupAddress}
                  </p>
                </div>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-sm bg-red-400"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/50 font-semibold uppercase mb-0.5">Destino</p>
                  <p className="text-sm text-white font-medium leading-tight" style={{ textWrap: 'balance' }}>
                    {destinationAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons - Enhanced styling */}
          <div className="flex gap-2.5">
            <button
              onClick={onReject}
              className="flex-1 py-3 px-4 bg-transparent hover:bg-red-500/10 backdrop-blur-sm rounded-2xl font-bold text-red-400 transition-all duration-300 ease-out active:scale-95 border-2 border-red-500/30 hover:border-red-500/50 text-sm"
            >
              Ignorar
            </button>
            <button
              onClick={onAccept}
              className="flex-[2] py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-2xl font-black transition-all duration-300 ease-out shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 text-base"
            >
              ACEPTAR VIAJE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preload notification audio for better performance
let notificationAudio = null;
try {
  notificationAudio = new Audio('/notification.mp3');
  notificationAudio.preload = 'auto';
} catch (e) {
  // Silently fail if audio can't be loaded
}

export function showRideRequestToast(ride, onAccept, onReject) {
  // DEFENSIVE: Validate ride object before proceeding
  if (!ride || typeof ride !== 'object') {
    console.error('Invalid ride object passed to showRideRequestToast:', ride);
    return null;
  }

  // Play notification sound if available
  if (notificationAudio) {
    notificationAudio.currentTime = 0; // Reset to start
    notificationAudio.play().catch(() => {
      // Silently fail if audio doesn't play
    });
  }

  // Vibrate if available
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }

  const toastId = toast.custom(
    (t) => (
      <ErrorBoundary>
        <div
          className={`transform transition-all duration-300 ease-out ${
            t.visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
          }`}
          style={{
            animation: t.visible 
              ? 'slideUpSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' 
              : 'slideDown 0.3s ease-in-out',
            zIndex: TOAST_Z_INDEX, // CRITICAL: Supreme z-index to float above everything
          }}
        >
          <RideRequestToast
            ride={ride}
            toastId={t.id}
            onAccept={() => {
              onAccept();
              toast.dismiss(t.id);
            }}
            onReject={() => {
              onReject();
              toast.dismiss(t.id);
            }}
          />
        </div>
      </ErrorBoundary>
    ),
    {
      duration: 30000, // 30 seconds to respond
      position: 'bottom-center',
      style: {
        maxWidth: '420px',
        // marginBottom handled by containerStyle in ToastProvider
      },
    }
  );

  return toastId;
}

export default RideRequestToast;

