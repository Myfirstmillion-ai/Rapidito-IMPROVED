import { motion } from "framer-motion";
import { Car } from "lucide-react";
import { cn } from "../../utils/cn";

function DriverMarker({ 
  position, 
  rotation = 0, 
  name,
  vehicle = "car",
  className 
}) {
  const vehicleIcons = {
    car: Car,
    bike: Car, // You can add more specific icons
    auto: Car,
  };

  const VehicleIcon = vehicleIcons[vehicle] || Car;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className={cn(
        "absolute pointer-events-none",
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      {/* Pulse animation */}
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-green-500 rounded-full -z-10"
        />
        
        {/* Driver marker */}
        <div className="relative w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <VehicleIcon size={24} className="text-white" />
        </div>

        {/* Name label (optional) */}
        {name && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow-md whitespace-nowrap text-xs font-medium">
            {name}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default DriverMarker;
