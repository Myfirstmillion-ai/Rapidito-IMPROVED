import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";

/**
 * Componente GestureHandler - Maneja interacciones gestuales para iOS Deluxe
 * 
 * Este componente proporciona una capa de interacción gestual avanzada para elementos
 * de la interfaz, permitiendo deslizamientos, arrastres, y efectos de rebote con física
 * de resortes que imitan el comportamiento de iOS.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido dentro del handler
 * @param {string} props.direction - Dirección del gesto ('horizontal', 'vertical', 'both')
 * @param {Function} props.onSwipeLeft - Función a llamar en deslizamiento izquierdo
 * @param {Function} props.onSwipeRight - Función a llamar en deslizamiento derecho
 * @param {Function} props.onSwipeUp - Función a llamar en deslizamiento hacia arriba
 * @param {Function} props.onSwipeDown - Función a llamar en deslizamiento hacia abajo
 * @param {number} props.threshold - Umbral de distancia para activar el deslizamiento
 * @param {boolean} props.dragElastic - Si el arrastre debe tener elasticidad
 * @param {Object} props.dragConstraints - Restricciones para el arrastre
 * @param {boolean} props.dragable - Si el componente se puede arrastrar
 * @param {string} props.className - Clases CSS adicionales
 */
const GestureHandler = ({
  children,
  direction = "horizontal",
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  dragElastic = 0.7,
  dragConstraints = { left: 0, right: 0, top: 0, bottom: 0 },
  draggable = true,
  className = "",
  ...props
}) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef(null);

  // Calcular la opacidad basada en la posición horizontal para efecto de desvanecimiento
  const opacity = useTransform(
    direction === "horizontal" ? x : y, 
    [-200, 0, 200], 
    [0.5, 1, 0.5]
  );
  
  // Calcular la rotación para dar efecto de giro en arrastres horizontales
  const rotate = useTransform(
    x,
    [-200, 0, 200],
    [-10, 0, 10]
  );

  // Detectar si debe permitir arrastre según la dirección
  const dragDirectionalProps = {
    ...(direction === "horizontal" || direction === "both" ? { dragDirectionLock: true } : {}),
    ...(direction === "horizontal" ? { drag: "x" } : {}),
    ...(direction === "vertical" ? { drag: "y" } : {}),
    ...(direction === "both" ? { drag: true } : {}),
  };

  // Manejar el final del arrastre
  const handleDragEnd = (event, info) => {
    const offset = direction === "horizontal" || direction === "both" ? info.offset.x : info.offset.y;
    const velocity = direction === "horizontal" || direction === "both" ? info.velocity.x : info.velocity.y;
    const absoluteOffset = Math.abs(offset);
    
    // Si la velocidad o distancia es suficiente, activa una acción de deslizamiento
    if (absoluteOffset > threshold || Math.abs(velocity) > 500) {
      if (direction === "horizontal" || direction === "both") {
        if (offset > 0 && onSwipeRight) {
          onSwipeRight(info);
          return;
        } else if (offset < 0 && onSwipeLeft) {
          onSwipeLeft(info);
          return;
        }
      }
      
      if (direction === "vertical" || direction === "both") {
        if (offset > 0 && onSwipeDown) {
          onSwipeDown(info);
          return;
        } else if (offset < 0 && onSwipeUp) {
          onSwipeUp(info);
          return;
        }
      }
    }
    
    // Si no hay suficiente movimiento para activar acción, anima de vuelta a la posición inicial
    controls.start({
      x: 0,
      y: 0,
      transition: { type: "spring", damping: 20, stiffness: 300 }
    });
  };

  // Cuando se inicia un arrastre
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // Manejar eventos táctiles
  useEffect(() => {
    if (!ref.current) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      if (!draggable) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      if (!draggable || !isDragging) return;
      
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      
      const diffX = touchX - touchStartX;
      const diffY = touchY - touchStartY;
      
      if (direction === "horizontal" || direction === "both") {
        x.set(diffX);
      }
      
      if (direction === "vertical" || direction === "both") {
        y.set(diffY);
      }
    };
    
    const element = ref.current;
    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchmove", handleTouchMove);
    
    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
    };
  }, [draggable, direction, isDragging, x, y]);

  return (
    <motion.div
      ref={ref}
      className={`touch-none ${className}`}
      style={{ 
        x, 
        y, 
        opacity: opacity, 
        rotate: direction === "horizontal" || direction === "both" ? rotate : 0
      }}
      animate={controls}
      initial={{ x: 0, y: 0 }}
      whileTap={{ scale: draggable ? 0.98 : 1 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      dragElastic={dragElastic}
      dragConstraints={dragConstraints}
      {...(draggable ? dragDirectionalProps : {})}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GestureHandler;
