import { useState, useEffect, useRef } from "react";
import { MapPin, X, Loader } from "lucide-react";
import debounce from "lodash.debounce";
import { searchLocations } from "../services/geocoding";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

function LocationSearchInput({ 
  value, 
  onChange, 
  placeholder = "Buscar ubicación...",
  onLocationSelect,
  className,
  icon: CustomIcon,
  autoFocus = false
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced search function - faster debounce
  const debouncedSearch = useRef(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const results = await searchLocations(searchQuery, {
        limit: 5,
      });
      setSuggestions(results);
      setIsLoading(false);
    }, 200) // Reduced from 300ms to 200ms for faster response
  ).current;

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setSuggestions([]);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    setShowSuggestions(true);
  };

  const handleSelectLocation = (location) => {
    setQuery(location.place_name);
    onChange?.(location.place_name);
    onLocationSelect?.(location);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery("");
    onChange?.("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // You can reverse geocode here if needed
          const locationText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setQuery(locationText);
          onChange?.(locationText);
          onLocationSelect?.({
            place_name: locationText,
            coordinates: [longitude, latitude],
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
    }
  };

  const Icon = CustomIcon || MapPin;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <motion.div 
        className="relative"
        style={{ willChange: "transform, opacity" }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
          {isLoading ? (
            <Loader size={20} className="animate-spin text-emerald-400" />
          ) : (
            <Icon size={20} className="text-emerald-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "w-full bg-slate-900/80 backdrop-blur-xl px-12 py-3 rounded-xl border-2 border-white/20",
            "outline-none text-sm transition-all duration-200 text-white placeholder:text-slate-400",
            "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 focus:bg-slate-900/90",
            "hover:bg-slate-900/85 hover:border-white/30",
            query && "pr-20"
          )}
        />
        
        {query && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-all active:scale-90 backdrop-blur-sm"
          >
            <X size={18} className="text-slate-300" />
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                onClick={() => handleSelectLocation(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-white/10 active:bg-white/15 transition-all border-b border-white/5 last:border-b-0 group"
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className="p-2 bg-emerald-500/20 backdrop-blur-sm rounded-lg border border-emerald-400/30 mt-0.5"
                  >
                    <MapPin size={16} className="text-emerald-400" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors whitespace-normal break-words">
                      {suggestion.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 whitespace-normal break-words">
                      {suggestion.place_name}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton for better UX */}
      <AnimatePresence>
        {isLoading && showSuggestions && suggestions.length === 0 && query.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden p-3"
          >
            {[...Array(3)].map((_, i) => (
              <div key={`skeleton-${i}`} className="flex items-start gap-3 py-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LocationSearchInput;
