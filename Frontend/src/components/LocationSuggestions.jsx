import { MapPin, Clock } from "lucide-react";
import Console from "../utils/console";
import { motion } from "framer-motion";

function LocationSuggestions({
  suggestions = [],
  setSuggestions,
  setPickupLocation,
  setDestinationLocation,
  input,
}) {
  // Determine if suggestion is a recent search (could be enhanced with actual logic)
  const isRecent = (suggestion, index) => {
    // For now, treat first 2 as recent if they match user's history pattern
    // In production, you'd check against localStorage or user history
    return false; // Placeholder - all are places for now
  };

  return (
    <div className="space-y-1.5">
      {suggestions.map((suggestion, index) => {
        const showAsRecent = isRecent(suggestion, index);
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ 
              duration: 0.25, 
              delay: index * 0.03,
              ease: [0.34, 1.56, 0.64, 1] // Spring ease
            }}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              Console.log(suggestion);
              if (input === "pickup") {
                setPickupLocation(suggestion);
                setSuggestions([]);
              }
              if (input === "destination") {
                setDestinationLocation(suggestion);
                setSuggestions([]);
              }
            }}
            className="cursor-pointer relative group"
          >
            {/* Premium Glass Row */}
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 hover:border-emerald-400/30 rounded-2xl py-3.5 px-3 transition-all duration-300 shadow-sm hover:shadow-lg">
              {/* Icon with Glass Badge */}
              <motion.div 
                className={`
                  backdrop-blur-sm p-2.5 rounded-xl border flex-shrink-0 transition-all
                  ${showAsRecent 
                    ? 'bg-cyan-500/20 border-cyan-400/30 hover:bg-cyan-500/30 hover:border-cyan-400/50' 
                    : 'bg-emerald-500/20 border-emerald-400/30 hover:bg-emerald-500/30 hover:border-emerald-400/50'
                  }
                `}
                whileHover={{ rotate: showAsRecent ? 0 : 360, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {showAsRecent ? (
                  <Clock size={18} className="text-cyan-400" />
                ) : (
                  <MapPin size={18} className="text-emerald-400" />
                )}
              </motion.div>

              {/* Suggestion Text */}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors leading-relaxed whitespace-normal break-words" style={{ textWrap: 'balance' }}>
                  {suggestion}
                </h2>
              </div>

              {/* Subtle chevron hint */}
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <div className="w-1.5 h-1.5 border-r-2 border-t-2 border-emerald-400 transform rotate-45"></div>
              </div>
            </div>

            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default LocationSuggestions;
