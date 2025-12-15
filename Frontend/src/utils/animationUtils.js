/**
 * 🪄 Animation Utilities for iOS Deluxe UI
 * 
 * Colección de configuraciones de animación, variantes y utilidades
 * para implementar micro-interacciones consistentes en toda la aplicación.
 * Utiliza los principios de diseño de iOS con énfasis en fluidez y respuesta táctil.
 */

// Configuración de springs para diferentes propósitos
export const springs = {
  // Para elementos de UI principal como cards, modales, etc.
  default: {
    type: "spring",
    damping: 25,
    stiffness: 300,
    mass: 1
  },
  
  // Para elementos pequeños y rápidos (badges, botones pequeños)
  snappy: {
    type: "spring", 
    damping: 30,
    stiffness: 500,
    mass: 0.8
  },
  
  // Para movimientos más suaves y elegantes (efectos visuales decorativos)
  gentle: {
    type: "spring",
    damping: 20,
    stiffness: 200,
    mass: 1.2
  },
  
  // Para elementos que necesitan rebote (éxito, alertas)
  bounce: {
    type: "spring",
    damping: 10,
    stiffness: 150,
    mass: 1,
    restDelta: 0.001
  },
  
  // Para transiciones rápidas sin spring (micro-interacciones simples)
  swift: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1]
  }
};

// Variantes de animación comunes
export const variants = {
  // Animaciones para elementos en vista/fuera de vista
  fadeInOut: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Deslizamiento hacia arriba para elementos que aparecen desde abajo
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  
  // Deslizamiento hacia abajo para elementos que aparecen desde arriba
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  // Escalado para elementos que aparecen/desaparecen con zoom
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  
  // Escalado con origen en el centro-arriba (para modales y menus dropdown)
  scaleTop: {
    initial: { opacity: 0, scale: 0.95, originY: 0 },
    animate: { opacity: 1, scale: 1, originY: 0 },
    exit: { opacity: 0, scale: 0.95, originY: 0 },
  },
  
  // Para listas con elementos que aparecen escalonados
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },
  
  // Elemento individual para listas escalonadas
  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  
  // Animación específica para botones de acción principal
  buttonPress: {
    rest: { scale: 1 },
    tap: { scale: 0.95 },
  },
  
  // Animación de pulso para llamar la atención
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }
    }
  },
  
  // Animación para tarjetas flotantes
  floatingCard: {
    animate: {
      y: [0, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut"
      }
    }
  }
};

// Comportamientos gestuales para elementos arrastables
export const gestures = {
  swipeToDismiss: {
    drag: "y",
    dragConstraints: { top: 0, bottom: 0 },
    dragElastic: 0.7,
    dragDirectionLock: true,
    onDragEnd: (e, { offset, velocity }) => {
      const swipeThreshold = 100;
      if (offset.y > swipeThreshold || velocity.y > 500) {
        return { y: "100%", opacity: 0, transition: springs.default };
      } else {
        return { y: 0, opacity: 1, transition: springs.default };
      }
    }
  },
  
  tilt: {
    whileHover: ({ clientX, clientY, currentTarget }) => {
      const rect = currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxTilt = 10;
      
      const tiltX = ((clientY - centerY) / (rect.height / 2)) * maxTilt;
      const tiltY = ((clientX - centerX) / (rect.width / 2)) * -maxTilt;
      
      return {
        rotateX: tiltX,
        rotateY: tiltY,
        transition: { duration: 0.2 }
      };
    }
  }
};

// Utilidad para determinar si se deben usar animaciones reducidas según preferencias del usuario
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Helper para agregar animación de entrada escalonada a un array de elementos
export const staggeredEntrance = (items, baseDelay = 0, staggerTime = 0.05) => {
  return items.map((item, index) => ({
    ...item,
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { delay: baseDelay + index * staggerTime } 
    },
    initial: { opacity: 0, y: 20 }
  }));
};

// Generar variantes de animación con spring personalizado
export const createVariantsWithSpring = (variants, spring) => {
  return Object.keys(variants).reduce((acc, key) => {
    const variant = variants[key];
    return {
      ...acc,
      [key]: {
        ...variant,
        transition: spring
      }
    };
  }, {});
};

// Configuración para animaciones de fondo tipo glassmorphism
export const glassAnimations = {
  hover: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    transition: springs.gentle
  },
  tap: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    scale: 0.98,
    transition: springs.snappy
  }
};

// Efecto de parallax para fondos
export const parallaxBackground = (scrollY, speed = 0.5) => {
  return {
    y: scrollY * speed,
    transition: { type: "tween", ease: "linear" }
  };
};

// Configuración para animaciones de transición entre pantallas
export const pageTransitions = {
  default: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: springs.default
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 }
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: springs.default
  }
};

// Utilidad para aplicar animación de rebote a valores numéricos
export const animateValue = (start, end, duration = 500, element, property) => {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    const value = start + (end - start) * easeProgress;
    
    if (element && property) {
      element.style[property] = value;
    }
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
    
    return value;
  };
  
  return window.requestAnimationFrame(step);
};

// Exportamos configuraciones combinadas para uso fácil
export default {
  springs,
  variants,
  gestures,
  shouldReduceMotion,
  staggeredEntrance,
  createVariantsWithSpring,
  glassAnimations,
  parallaxBackground,
  pageTransitions,
  animateValue
};
