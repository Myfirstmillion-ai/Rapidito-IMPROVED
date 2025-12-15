import { motion } from "framer-motion";
import Card from "./common/Card";
import { glassAnimations } from "../utils/animationUtils";

/**
 * Componente de esqueleto de carga con estilo iOS Deluxe
 * 
 * Proporciona esqueletos animados para diferentes tipos de contenido
 * durante la carga de datos, con efectos de pulso y gradientes
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.type - Tipo de esqueleto (card, list, profile, ride, etc.)
 * @param {number} props.count - Número de elementos a renderizar
 * @param {boolean} props.showHeader - Si debe mostrar el encabezado
 * @param {string} props.className - Clases CSS adicionales
 */
const SkeletonLoader = ({ 
  type = "card", 
  count = 1, 
  showHeader = false, 
  className = "" 
}) => {
  // Efecto de pulso para el esqueleto
  const pulseAnimation = {
    animate: {
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Renderizar esqueleto de tipo card
  const renderCardSkeleton = () => (
    <Card
      variant="glass"
      className="w-full overflow-hidden backdrop-blur-md border border-white/10 p-4"
    >
      <div className="flex flex-col space-y-4">
        {showHeader && (
          <div className="flex items-center gap-3 mb-2">
            <motion.div 
              variants={pulseAnimation}
              animate="animate"
              className="w-12 h-12 rounded-full bg-white/10" 
            />
            <div className="flex-1 space-y-2">
              <motion.div 
                variants={pulseAnimation}
                animate="animate"
                className="h-5 w-24 bg-white/10 rounded-md" 
              />
              <motion.div 
                variants={pulseAnimation}
                animate="animate"
                className="h-3 w-32 bg-white/10 rounded-md" 
              />
            </div>
          </div>
        )}
        
        <motion.div 
          variants={pulseAnimation}
          animate="animate"
          className="w-full h-4 bg-white/10 rounded-md" 
        />
        <motion.div 
          variants={pulseAnimation}
          animate="animate"
          className="w-3/4 h-4 bg-white/10 rounded-md" 
        />
        <motion.div 
          variants={pulseAnimation}
          animate="animate"
          className="w-1/2 h-4 bg-white/10 rounded-md" 
        />
      </div>
    </Card>
  );

  // Renderizar esqueleto de tipo lista
  const renderListSkeleton = () => (
    <Card
      variant="glass"
      className="w-full overflow-hidden backdrop-blur-md border border-white/10 p-2"
    >
      <div className="flex flex-col divide-y divide-white/10">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="py-3 px-2 flex items-center gap-3">
            <motion.div 
              variants={pulseAnimation}
              animate="animate"
              className="w-10 h-10 rounded-full bg-white/10" 
            />
            <div className="flex-1 space-y-2">
              <motion.div 
                variants={pulseAnimation}
                animate="animate"
                className="h-3 w-3/4 bg-white/10 rounded-md" 
              />
              <motion.div 
                variants={pulseAnimation}
                animate="animate"
                className="h-2 w-1/2 bg-white/10 rounded-md" 
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  // Renderizar esqueleto de tipo perfil
  const renderProfileSkeleton = () => (
    <div className="w-full flex flex-col items-center">
      <motion.div 
        variants={pulseAnimation}
        animate="animate"
        className="w-24 h-24 rounded-full bg-white/10 mb-4 border border-white/20" 
      />
      <motion.div 
        variants={pulseAnimation}
        animate="animate"
        className="h-6 w-32 bg-white/10 rounded-md mb-2" 
      />
      <motion.div 
        variants={pulseAnimation}
        animate="animate"
        className="h-4 w-48 bg-white/10 rounded-md mb-6" 
      />
      
      <div className="w-full space-y-4">
        <Card variant="glass" className="p-4 backdrop-blur-md border border-white/10">
          <div className="space-y-4">
            <motion.div 
              variants={pulseAnimation}
              animate="animate"
              className="h-4 w-full bg-white/10 rounded-md" 
            />
            <motion.div 
              variants={pulseAnimation}
              animate="animate"
              className="h-4 w-3/4 bg-white/10 rounded-md" 
            />
          </div>
        </Card>
        
        <Card variant="glass" className="p-4 backdrop-blur-md border border-white/10">
          <div className="space-y-4">
            <motion.div 
              variants={pulseAnimation}
              animate="animate"
              className="h-4 w-full bg-white/10 rounded-md" 
            />
            <motion.div 
              variants={pulseAnimation}
              animate="animate"
              className="h-4 w-3/4 bg-white/10 rounded-md" 
            />
          </div>
        </Card>
      </div>
    </div>
  );

  // Renderizar esqueleto de tipo viaje
  const renderRideSkeleton = () => (
    <Card
      variant="glass"
      className="w-full overflow-hidden backdrop-blur-md border border-white/10 p-4"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <motion.div 
            variants={pulseAnimation}
            animate="animate"
            className="w-10 h-10 rounded-full bg-white/10" 
          />
          <motion.div 
            variants={pulseAnimation}
            animate="animate"
            className="h-5 w-24 bg-white/10 rounded-md" 
          />
        </div>
        <motion.div 
          variants={pulseAnimation}
          animate="animate"
          className="h-6 w-20 bg-white/10 rounded-md" 
        />
      </div>
      
      <div className="relative pl-6 mb-4">
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-white/10"></div>
        <div className="absolute left-0 top-2 -translate-x-[3px] w-2 h-2 rounded-full bg-white/30"></div>
        <div className="absolute left-0 bottom-2 -translate-x-[3px] w-2 h-2 rounded-full bg-white/20"></div>
        
        <div className="space-y-6">
          <div>
            <motion.div 
              variants={pulseAnimation}
              animate="animate"
              className="h-4 w-3/4 bg-white/10 rounded-md mb-1" 
            />
            <motion.div 
              variants={pulseAnimation}
              animate="animate"
              className="h-3 w-1/2 bg-white/10 rounded-md" 
            />
          </div>
          <div>
            <motion.div 
              variants={pulseAnimation}
              animate="animate"
              className="h-4 w-3/4 bg-white/10 rounded-md mb-1" 
            />
            <motion.div 
              variants={pulseAnimation}
              animate="animate"
              className="h-3 w-1/2 bg-white/10 rounded-md" 
            />
          </div>
        </div>
      </div>
    </Card>
  );

  // Renderizar esqueleto según el tipo
  const renderSkeleton = () => {
    switch (type) {
      case "list":
        return renderListSkeleton();
      case "profile":
        return renderProfileSkeleton();
      case "ride":
        return renderRideSkeleton();
      case "card":
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {[...Array(type === "list" ? 1 : count)].map((_, i) => (
        <div key={i} className="mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
