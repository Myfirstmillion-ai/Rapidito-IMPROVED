import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Car, 
  Bike, 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  Star,
  Share2,
  Download,
  DollarSign
} from "lucide-react";
import Button from "./common/Button";
import Card from "./common/Card";
import Badge from "./common/Badge";
import { colors } from "../styles/designSystem";
import MapboxStaticMap from "./maps/MapboxStaticMap";

// Variantes de animación para iOS Deluxe
const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { opacity: 0, y: 30, transition: { duration: 0.2 } }
  },
  staggerItems: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  }
};

const Receipt = ({ ride, isOpen, onClose }) => {
  const [isShare, setIsShare] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  
  // Determinar si es la versión móvil basado en el ancho de pantalla
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Si no hay datos del viaje o no está abierto, no renderizar nada
  if (!ride || !isOpen) return null;

  // Formateo de fecha en formato largo
  const formatLongDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { 
      weekday: "long", 
      day: "numeric", 
      month: "long", 
      year: "numeric",
      hour: "numeric",
      minute: "numeric"
    });
  };
  
  // Formateo de fecha corta
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { 
      day: "numeric", 
      month: "short"
    });
  };
  
  // Formateo de hora
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", { 
      hour: "numeric",
      minute: "numeric"
    });
  };

  // Simulación de descarga de recibo
  const handleDownload = () => {
    setDownloadLoading(true);
    setTimeout(() => {
      setDownloadLoading(false);
      // Aquí iría la lógica real de descarga
      alert("Recibo descargado como PDF");
    }, 1500);
  };

  // Simulación de compartir recibo
  const handleShare = () => {
    setShareLoading(true);
    setTimeout(() => {
      setShareLoading(false);
      setIsShare(true);
      // Aquí iría la lógica real de compartir
      setTimeout(() => setIsShare(false), 3000);
    }, 1500);
  };
  
  // Detalles del conductor
  const driverInfo = ride.captain || ride.driver;
  const vehicle = driverInfo?.vehicle;
  const VehicleIcon = ride.vehicleType === "bike" ? Bike : Car;
  
  // Componentes para los detalles del recibo
  const receiptItems = [
    {
      id: "fare",
      label: "Tarifa base",
      value: `$${((ride.fare || 0) * 0.8).toLocaleString("es-CO")}`
    },
    {
      id: "distance",
      label: "Cargo por distancia",
      value: `$${((ride.fare || 0) * 0.15).toLocaleString("es-CO")}`
    },
    {
      id: "time",
      label: "Cargo por tiempo",
      value: `$${((ride.fare || 0) * 0.05).toLocaleString("es-CO")}`
    },
    {
      id: "total",
      label: "Total",
      value: `$${(ride.fare || 0).toLocaleString("es-CO")}`,
      isTotal: true
    }
  ];

  return (
    <motion.div
      variants={animationVariants.fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => onClose()}
    >
      <motion.div
        variants={animationVariants.slideUp}
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card
          variant="floating"
          className="overflow-hidden"
        >
          {/* Header con mapa estático */}
          <div className="relative h-40">
            {/* Mapa estático en segundo plano */}
            <div className="absolute inset-0 bg-gray-900">
              {ride.pickupCoordinates && ride.destinationCoordinates && (
                <MapboxStaticMap
                  pickupCoords={ride.pickupCoordinates}
                  destinationCoords={ride.destinationCoordinates}
                  zoom={13}
                  width="100%"
                  height="100%"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />
            </div>
            
            {/* Botón de cerrar */}
            <div className="absolute top-4 right-4">
              <Button
                variant="glass"
                size="icon"
                icon={<X size={16} />}
                onClick={onClose}
                aria-label="Cerrar"
              />
            </div>
            
            {/* Información del viaje en el mapa */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge
                    variant={ride.status === "completed" ? "success" : "error"}
                    text={ride.status === "completed" ? "Completado" : "Cancelado"}
                    className="mb-1"
                  />
                  <h3 className="text-lg font-bold text-white">
                    Recibo de viaje
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/70">
                    {formatDate(ride.createdAt)}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {formatTime(ride.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del recibo */}
          <div className="p-5">
            <motion.div
              variants={animationVariants.staggerItems}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              {/* Sección de ruta */}
              <motion.div variants={animationVariants.staggerItem}>
                <p className="text-sm text-white/70 mb-2">Ruta del viaje</p>
                <div className="relative pl-6">
                  {/* Línea de ruta */}
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#10B981] to-white/30"></div>
                  
                  {/* Punto de origen */}
                  <div className="absolute left-0 top-2 -translate-x-[3px] w-2 h-2 rounded-full bg-[#10B981]"></div>
                  
                  {/* Punto de destino */}
                  <div className="absolute left-0 bottom-2 -translate-x-[3px] w-2 h-2 rounded-full bg-white/50"></div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-semibold text-white line-clamp-1">
                        {ride.pickup?.split(", ")[0] || "Origen"}
                      </p>
                      <p className="text-xs text-white/60">
                        {ride.pickup?.split(", ").slice(1).join(", ") || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white line-clamp-1">
                        {ride.destination?.split(", ")[0] || "Destino"}
                      </p>
                      <p className="text-xs text-white/60">
                        {ride.destination?.split(", ").slice(1).join(", ") || ""}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sección de conductor */}
              {ride.status === "completed" && driverInfo && (
                <motion.div variants={animationVariants.staggerItem}>
                  <p className="text-sm text-white/70 mb-2">Conductor</p>
                  <Card variant="glass" className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden">
                        {driverInfo.profileImage ? (
                          <img 
                            src={driverInfo.profileImage} 
                            alt={driverInfo.fullname?.firstname || "Driver"}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#10B981]/50">
                            <User size={24} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">
                          {driverInfo.fullname?.firstname || driverInfo.firstname || driverInfo.name || "Conductor"}
                          {" "}
                          {driverInfo.fullname?.lastname || driverInfo.lastname || ""}
                        </p>
                        {vehicle && (
                          <p className="text-xs text-white/60">
                            {vehicle.make || ""} {vehicle.model || ""} 
                            {vehicle.color && ` - ${vehicle.color}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <VehicleIcon size={16} className="text-white/70 mr-1" />
                        <span className="text-sm text-white">
                          {ride.vehicleType === "car" ? "Carro" : "Moto"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Detalles del pago */}
              <motion.div variants={animationVariants.staggerItem}>
                <p className="text-sm text-white/70 mb-2">Detalles del pago</p>
                <Card variant="glass" className="p-4 divide-y divide-white/10">
                  {receiptItems.map((item) => (
                    <div 
                      key={item.id}
                      className={`py-2 flex justify-between items-center ${item.isTotal ? 'pt-3' : ''}`}
                    >
                      <p className={`text-sm ${item.isTotal ? 'font-semibold text-white' : 'text-white/70'}`}>
                        {item.label}
                      </p>
                      <p className={`text-sm ${item.isTotal ? 'font-bold text-white' : 'font-medium text-white'}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                  
                  <div className="pt-3 pb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard size={16} className="text-white/70 mr-2" />
                        <p className="text-sm text-white/70">
                          Método de pago
                        </p>
                      </div>
                      <p className="text-sm font-medium text-white">
                        Tarjeta •••• 4242
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              {/* Sección de calificación */}
              {ride.rating > 0 && (
                <motion.div variants={animationVariants.staggerItem}>
                  <p className="text-sm text-white/70 mb-2">Tu calificación</p>
                  <Card variant="glass" className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={i < ride.rating ? "fill-amber-400 text-amber-400" : "text-white/20"} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-white ml-2">
                        {ride.rating}/5
                      </span>
                    </div>
                    {ride.ratingComment && (
                      <p className="mt-2 text-sm text-white/70 italic">
                        "{ride.ratingComment}"
                      </p>
                    )}
                  </Card>
                </motion.div>
              )}
              
              {/* Botones de acción */}
              <motion.div 
                variants={animationVariants.staggerItem}
                className="flex gap-3 pt-2"
              >
                <Button
                  variant="glass"
                  size="large"
                  title={downloadLoading ? "Descargando..." : "Descargar PDF"}
                  icon={downloadLoading ? null : <Download size={16} />}
                  onClick={handleDownload}
                  disabled={downloadLoading}
                  loading={downloadLoading}
                  className="flex-1"
                />
                <Button
                  variant="glass"
                  size="large"
                  title={shareLoading ? "Compartiendo..." : isShare ? "¡Enlace copiado!" : "Compartir"}
                  icon={shareLoading ? null : <Share2 size={16} />}
                  onClick={handleShare}
                  disabled={shareLoading || isShare}
                  loading={shareLoading}
                  className="flex-1"
                />
              </motion.div>
              
              {/* Footer con ID del viaje */}
              <motion.div 
                variants={animationVariants.staggerItem}
                className="text-center pt-2"
              >
                <p className="text-xs text-white/50">
                  ID del viaje: {ride._id}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Receipt;
