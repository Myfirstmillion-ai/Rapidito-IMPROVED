import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Briefcase, Star, MapPin, X, Search } from "lucide-react";
import axios from "axios";
import Button from "./common/Button";
import Card from "./common/Card";
import Input from "./common/Input";
import { colors, shadows, glassEffect, borderRadius } from "../styles/designSystem";

/**
 * SaveLocationModal - Modal para guardar ubicaciones favoritas con estilo iOS Deluxe
 * 
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar la ubicación
 * @param {Object} props.initialLocation - Ubicación inicial para editar (opcional)
 * @param {string} props.address - Dirección preseleccionada (opcional)
 * @param {Object} props.coordinates - Coordenadas preseleccionadas (opcional)
 */
function SaveLocationModal({ isOpen, onClose, onSave, initialLocation = null, address = "", coordinates = null }) {
  const token = localStorage.getItem("token");
  const [type, setType] = useState(initialLocation?.type || "home");
  const [label, setLabel] = useState(initialLocation?.label || "");
  const [selectedAddress, setSelectedAddress] = useState(initialLocation?.address || address || "");
  const [selectedCoordinates, setSelectedCoordinates] = useState(initialLocation?.coordinates || coordinates || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset form state when the modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setType(initialLocation?.type || "home");
      setLabel(initialLocation?.label || "");
      setSelectedAddress(initialLocation?.address || address || "");
      setSelectedCoordinates(initialLocation?.coordinates || coordinates || null);
      setSearchQuery("");
      setSuggestions([]);
      setError("");
    }
  }, [isOpen, initialLocation, address, coordinates]);

  // Buscar direcciones con debounce
  useEffect(() => {
    if (searchQuery.length < 3) return;
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/map/search-location?query=${encodeURIComponent(searchQuery)}`,
          { headers: { token } }
        );
        
        if (response.data && response.data.suggestions) {
          setSuggestions(response.data.suggestions);
        }
      } catch (error) {
        console.error("Error buscando ubicaciones:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, token]);

  // Seleccionar sugerencia de ubicación
  const handleSelectLocation = (suggestion) => {
    setSelectedAddress(suggestion.address);
    setSelectedCoordinates(suggestion.coordinates);
    setSearchQuery("");
    setSuggestions([]);
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    // Validaciones
    if (!selectedAddress) {
      setError("Por favor selecciona una ubicación");
      return;
    }

    if (!selectedCoordinates) {
      setError("No se pudieron obtener las coordenadas de la ubicación");
      return;
    }

    if (type === "favorite" && !label) {
      setError("Por favor ingresa un nombre para esta ubicación");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Preparar los datos de la ubicación
      const locationData = {
        type,
        address: selectedAddress,
        coordinates: selectedCoordinates,
      };

      // Agregar label si es de tipo favorite
      if (type === "favorite") {
        locationData.label = label;
      }

      // Llamar a la función onSave con los datos
      await onSave(locationData, initialLocation?._id);
      onClose();
    } catch (error) {
      console.error("Error guardando ubicación:", error);
      setError(
        error.response?.data?.message || 
        "Ocurrió un error al guardar la ubicación"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Variantes de animación con física de springs para iOS Deluxe
  const modalVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      y: 100,
      transition: {
        duration: 0.2
      }
    }
  };

  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay de fondo */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backgroundVariants}
            onClick={onClose}
          />
          
          {/* Modal con glassmorphism */}
          <motion.div 
            className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[90vh] sm:rounded-2xl"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <Card
              variant="floating"
              className="relative w-full overflow-hidden sm:max-w-md"
            >
              {/* Handle para móvil */}
              <div className="absolute top-0 left-0 right-0 flex justify-center pt-2">
                <div className="w-12 h-1 bg-white/20 rounded-full"></div>
              </div>
              
              {/* Botón de cerrar */}
              <Button
                variant="glass"
                size="icon"
                icon={<X size={18} />}
                onClick={onClose}
                className="absolute top-4 right-4"
                aria-label="Cerrar"
              />
              
              {/* Encabezado */}
              <div className="px-6 pt-8 pb-4">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {initialLocation ? "Editar ubicación" : "Guardar ubicación"}
                </h2>
                <p className="text-white/60 text-sm">
                  {initialLocation 
                    ? "Actualiza los detalles de tu ubicación guardada" 
                    : "Guarda una ubicación para acceder rápidamente"}
                </p>
              </div>
              
              {/* Cuerpo del modal */}
              <div className="px-6 pb-6">
                {/* Selector de tipo */}
                <div className="mb-6">
                  <label className="text-sm text-white/70 mb-2 block">Tipo de ubicación</label>
                  <div className="flex gap-3">
                    <TypeButton
                      icon={<Home size={20} />}
                      label="Casa"
                      isSelected={type === "home"}
                      onClick={() => setType("home")}
                    />
                    <TypeButton
                      icon={<Briefcase size={20} />}
                      label="Trabajo"
                      isSelected={type === "work"}
                      onClick={() => setType("work")}
                    />
                    <TypeButton
                      icon={<Star size={20} />}
                      label="Favorito"
                      isSelected={type === "favorite"}
                      onClick={() => setType("favorite")}
                    />
                  </div>
                </div>
                
                {/* Campo de nombre (solo para favoritos) */}
                {type === "favorite" && (
                  <div className="mb-6">
                    <Input
                      label="Nombre"
                      placeholder="Ej: Gimnasio, Casa de mamá..."
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      icon={<Star size={18} />}
                    />
                  </div>
                )}
                
                {/* Buscador de ubicaciones */}
                <div className="mb-6">
                  <label className="text-sm text-white/70 mb-2 block">Ubicación</label>
                  <div className="relative">
                    <Input
                      placeholder="Busca una dirección"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search size={18} />}
                    />
                    
                    {/* Ubicación seleccionada */}
                    {selectedAddress && !searchQuery && (
                      <div className="mt-3 p-3 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm">
                        <div className="flex gap-2 items-start">
                          <MapPin size={18} className="text-white/70 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white/90">{selectedAddress}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Sugerencias */}
                    {searchQuery.length > 0 && (
                      <div className="absolute left-0 right-0 mt-2 z-10 max-h-60 overflow-auto rounded-xl border border-white/20 bg-black/80 backdrop-blur-xl shadow-xl">
                        {isSearching ? (
                          <div className="p-3 flex items-center justify-center text-white/70">
                            <span className="animate-spin mr-2">
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            </span>
                            Buscando...
                          </div>
                        ) : suggestions.length > 0 ? (
                          suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              onClick={() => handleSelectLocation(suggestion)}
                            >
                              <div className="flex gap-2 items-start">
                                <MapPin size={18} className="text-white/70 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">{suggestion.address}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-white/70 text-center">
                            No se encontraron resultados
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mensajes de error */}
                {error && (
                  <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                
                {/* Botón de guardar */}
                <Button
                  variant="primary"
                  size="large"
                  title={isSubmitting ? "Guardando..." : "Guardar ubicación"}
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Componente para los botones de tipo de ubicación
function TypeButton({ icon, label, isSelected, onClick }) {
  return (
    <motion.button
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border ${
        isSelected 
          ? "border-[#10B981] bg-[#10B981]/10" 
          : "border-white/10 bg-white/5"
      }`}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`${isSelected ? "text-[#10B981]" : "text-white/70"}`}>
        {icon}
      </div>
      <span className={`text-xs ${isSelected ? "text-[#10B981] font-medium" : "text-white/70"}`}>
        {label}
      </span>
    </motion.button>
  );
}

export default SaveLocationModal;
