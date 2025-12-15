import { motion } from "framer-motion";

/**
 * Componente LoadingIndicator - Indicador de carga con estilo iOS Deluxe
 * 
 * Proporciona varios estilos de indicadores de carga con animaciones fluidas
 * y efectos visuales que siguen la estética iOS Deluxe.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.type - Tipo de indicador (spinner, dots, pulse, progress)
 * @param {string} props.size - Tamaño del indicador (small, medium, large)
 * @param {string} props.color - Color personalizado (opcional)
 * @param {number} props.progress - Valor de progreso para tipo 'progress' (0-100)
 * @param {string} props.text - Texto a mostrar junto al indicador
 * @param {string} props.className - Clases CSS adicionales
 */
const LoadingIndicator = ({
  type = "spinner",
  size = "medium",
  color,
  progress = 0,
  text,
  className = "",
}) => {
  // Determinar el tamaño en píxeles según la opción
  const getSize = () => {
    switch (size) {
      case "small": return 24;
      case "large": return 48;
      case "medium":
      default: return 36;
    }
  };

  // Establecer color según la propiedad o usar el color predeterminado
  const getColor = () => {
    return color || "rgba(255, 255, 255, 0.8)";
  };
  
  // Obtener tamaño en píxeles
  const sizeInPx = getSize();
  const colorValue = getColor();

  // Renderizar spinner (circulo giratorio)
  const renderSpinner = () => (
    <div className="relative" style={{ width: sizeInPx, height: sizeInPx }}>
      {/* Fondo glassmórfico */}
      <div 
        className="absolute inset-0 rounded-full" 
        style={{ 
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      ></div>
      
      {/* Círculos en rotación */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg width={sizeInPx} height={sizeInPx} viewBox={`0 0 ${sizeInPx} ${sizeInPx}`}>
          <circle
            cx={sizeInPx / 2}
            cy={sizeInPx / 2}
            r={(sizeInPx / 2) - 3}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
            fill="none"
          />
          <motion.circle
            cx={sizeInPx / 2}
            cy={sizeInPx / 2}
            r={(sizeInPx / 2) - 3}
            stroke={colorValue}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${sizeInPx * 1.2} ${sizeInPx * 2}`}
            fill="none"
            animate={{ 
              rotate: [0, 360],
              strokeDasharray: [
                `${sizeInPx * 0.1} ${sizeInPx * 2}`,
                `${sizeInPx * 1.2} ${sizeInPx * 2}`,
                `${sizeInPx * 0.1} ${sizeInPx * 2}`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>
    </div>
  );

  // Renderizar dots (puntos pulsantes)
  const renderDots = () => (
    <div className="flex items-center justify-center gap-1" style={{ height: sizeInPx }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ 
            width: sizeInPx / 5,
            height: sizeInPx / 5,
            background: colorValue,
            boxShadow: `0 0 ${sizeInPx/8}px ${colorValue}80`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  // Renderizar pulse (circulo pulsante)
  const renderPulse = () => (
    <div className="relative" style={{ width: sizeInPx, height: sizeInPx }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: colorValue }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 0.3, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute inset-[15%] rounded-full"
        style={{ background: colorValue, boxShadow: `0 0 ${sizeInPx/4}px ${colorValue}80` }}
        animate={{
          scale: [0.8, 1, 0.8],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );

  // Renderizar progress (barra de progreso)
  const renderProgress = () => {
    const width = Math.min(100, Math.max(0, progress));
    
    return (
      <div 
        className="relative overflow-hidden rounded-full"
        style={{ 
          width: sizeInPx * 3, 
          height: sizeInPx / 3,
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        <motion.div
          className="absolute top-0 left-0 bottom-0 rounded-full"
          style={{ background: colorValue }}
          initial={{ width: "0%" }}
          animate={{ width: `${width}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        />
        
        {/* Efecto de brillo en la barra */}
        <motion.div 
          className="absolute top-0 bottom-0 w-20 skew-x-30 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ 
            left: ["-100%", "100%"],
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut",
            repeatDelay: 0.5
          }}
        />
      </div>
    );
  };

  // Renderizar el indicador según el tipo
  const renderIndicator = () => {
    switch (type) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "progress":
        return renderProgress();
      case "spinner":
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderIndicator()}
      
      {text && (
        <motion.p
          className="mt-3 text-sm text-white/70"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingIndicator;
