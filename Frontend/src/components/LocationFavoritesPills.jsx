import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Briefcase, Star, Plus, Loader2 } from "lucide-react";
import axios from "axios";

/**
 * LocationFavoritesPills - Componente de botones rápidos para ubicaciones favoritas
 * 
 * @param {Object} props
 * @param {Function} props.onSelectLocation - Función para seleccionar una ubicación
 * @param {Function} props.onAddFavorite - Función para abrir el modal de agregar favorito
 * @param {Function} props.onEditFavorite - Función para editar un favorito existente
 */
function LocationFavoritesPills({ onSelectLocation, onAddFavorite, onEditFavorite }) {
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pressTimer, setPressTimer] = useState(null);
  const [longPressedLocation, setLongPressedLocation] = useState(null);

  const token = localStorage.getItem("token");

  // Cargar ubicaciones guardadas
  useEffect(() => {
    const fetchSavedLocations = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/user/saved-locations`,
          { headers: { token } }
        );
        
        if (response.data && response.data.locations) {
          setSavedLocations(response.data.locations);
        }
      } catch (error) {
        console.error("Error obteniendo ubicaciones guardadas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedLocations();
  }, [token]);

  // Iniciar temporizador para long press
  const handlePressStart = (location) => {
    setPressTimer(
      setTimeout(() => {
        setLongPressedLocation(location);
        onEditFavorite(location);
      }, 500) // 500ms para detectar long press
    );
  };

  // Cancelar temporizador si se suelta antes de tiempo
  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  // Tap normal para seleccionar ubicación
  const handleTap = (location) => {
    if (!longPressedLocation) {
      onSelectLocation(location);
    }
    setLongPressedLocation(null);
  };

  // Obtener ícono según el tipo de ubicación
  const getIconForLocationType = (type) => {
    switch (type) {
      case "home":
        return <Home size={18} />;
      case "work":
        return <Briefcase size={18} />;
      case "favorite":
        return <Star size={18} />;
      default:
        return <Star size={18} />;
    }
  };

  // Obtener etiqueta para mostrar según el tipo
  const getLabelForLocation = (location) => {
    switch (location.type) {
      case "home":
        return "Casa";
      case "work":
        return "Trabajo";
      case "favorite":
        return location.label;
      default:
        return "Favorito";
    }
  };

  // Animaciones para botones con física de springs
  const pillHoverAnimation = { 
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  };

  const pillTapAnimation = { 
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  };

  // Renderiza el contenedor con scroll horizontal
  return (
    <div className="w-full overflow-x-auto scrollbar-hide pb-2 pt-1">
      <div className="flex gap-2 px-0.5 snap-x snap-mandatory">
        {/* Botones para casa y trabajo */}
        {savedLocations.filter(loc => loc.type === 'home' || loc.type === 'work').map((location) => (
          <motion.div
            key={location._id}
            className="flex-shrink-0 snap-start"
            whileHover={pillHoverAnimation}
            whileTap={pillTapAnimation}
            onTouchStart={() => handlePressStart(location)}
            onTouchEnd={() => handlePressEnd()}
            onMouseDown={() => handlePressStart(location)}
            onMouseUp={() => handlePressEnd()}
            onMouseLeave={() => handlePressEnd()}
            onClick={() => handleTap(location)}
          >
            <div className={`
              flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md border
              ${location.type === 'home' ? 'border-blue-500/30 bg-blue-500/10' : 'border-amber-500/30 bg-amber-500/10'}
            `}>
              <span className={`
                ${location.type === 'home' ? 'text-blue-400' : 'text-amber-400'}
              `}>
                {getIconForLocationType(location.type)}
              </span>
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {getLabelForLocation(location)}
              </span>
            </div>
          </motion.div>
        ))}
        
        {/* Botones para favoritos */}
        {savedLocations.filter(loc => loc.type === 'favorite').map((location) => (
          <motion.div
            key={location._id}
            className="flex-shrink-0 snap-start"
            whileHover={pillHoverAnimation}
            whileTap={pillTapAnimation}
            onTouchStart={() => handlePressStart(location)}
            onTouchEnd={() => handlePressEnd()}
            onMouseDown={() => handlePressStart(location)}
            onMouseUp={() => handlePressEnd()}
            onMouseLeave={() => handlePressEnd()}
            onClick={() => handleTap(location)}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md border border-purple-500/30 bg-purple-500/10">
              <span className="text-purple-400">
                {getIconForLocationType(location.type)}
              </span>
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {getLabelForLocation(location)}
              </span>
            </div>
          </motion.div>
        ))}
        
        {/* Botón para agregar nuevo favorito */}
        <motion.div
          className="flex-shrink-0 snap-start"
          whileHover={pillHoverAnimation}
          whileTap={pillTapAnimation}
          onClick={onAddFavorite}
        >
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md border border-white/20 bg-white/5">
            <span className="text-white/70">
              <Plus size={18} />
            </span>
            <span className="text-sm font-medium text-white/70 whitespace-nowrap">
              Agregar
            </span>
          </div>
        </motion.div>
        
        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center gap-2 px-4 py-2.5">
            <Loader2 size={18} className="animate-spin text-white/50" />
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationFavoritesPills;
