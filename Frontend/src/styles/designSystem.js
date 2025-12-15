/**
 * Rapi-dito Premium UI Design System
 * iOS Deluxe Floating System
 */

// Color Palette - Monochromatic Premium
export const colors = {
  // Core colors
  primary: '#000000', // True Black
  surface: '#0A0A0A', // Deep Dark
  card: '#141414', // Elevated Dark
  border: 'rgba(255,255,255,0.08)', // Subtle Divider
  
  // Text colors
  textPrimary: '#FFFFFF', // Pure White
  textSecondary: 'rgba(255,255,255,0.65)', // Muted White
  
  // Status colors
  accent: '#0A84FF', // iOS Blue - Solo para CTAs críticos
  success: '#30D158', // iOS Green
  warning: '#FF9F0A', // iOS Orange
  error: '#FF453A', // iOS Red
  
  // Functional colors
  overlay: 'rgba(0,0,0,0.4)', // Map dimming overlay
  glassBg: 'rgba(20, 20, 20, 0.85)', // Glassmorphism background
  glassGlow: 'rgba(10, 132, 255, 0.2)', // Accent color glow for focus states
}

// Typography System
export const typography = {
  fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  
  // Font sizes
  display: {
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: 1.4,
  },
  title1: {
    fontSize: '28px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  title2: {
    fontSize: '22px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body: {
    fontSize: '17px',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  caption: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  
  // Responsive variants
  mobile: {
    display: {
      fontSize: '30px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    title1: {
      fontSize: '26px',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    title2: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body: {
      fontSize: '15px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '11px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  }
}

// Spacing Scale
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px', 
  base: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  
  // Special cases
  cardPadding: '20px',
}

// Border Radius Scale
export const borderRadius = {
  small: '8px', // Buttons, inputs
  medium: '16px', // Cards pequeños
  large: '24px', // Cards grandes, modals
  xlarge: '32px', // Floating islands principales
  full: '9999px', // Pills, badges
}

// Shadow System (Depth Layers)
export const shadows = {
  level1: '0 2px 8px rgba(0,0,0,0.12)', // Subtle elevation
  level2: '0 4px 16px rgba(0,0,0,0.16)', // Cards
  level3: '0 8px 24px rgba(0,0,0,0.20)', // Modals
  level4: '0 16px 48px rgba(0,0,0,0.28)', // Floating islands
}

// Glassmorphism Effect
export const glassEffect = {
  background: 'rgba(20, 20, 20, 0.85)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.08)',
}

// Animation Constants
export const animation = {
  spring: 'spring(1, 0.9, 10, 0)',
  easeDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
}

// Breakpoints
export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
}

// Z-index stack
export const zIndex = {
  base: 0,
  above: 10,
  modal: 50,
  toast: 60,
  highest: 100,
}

// Responsive mixins
export const responsive = {
  mobile: `@media (max-width: ${breakpoints.tablet})`,
  tablet: `@media (min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.desktop})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
}

// Common style presets
export const presets = {
  // Glassmorphism preset
  glass: {
    background: glassEffect.background,
    backdropFilter: glassEffect.backdropFilter,
    border: glassEffect.border,
    borderRadius: borderRadius.medium,
  },
  
  // Floating island preset
  floatingIsland: {
    background: glassEffect.background,
    backdropFilter: glassEffect.backdropFilter,
    border: glassEffect.border,
    borderRadius: borderRadius.xlarge,
    boxShadow: shadows.level4,
    padding: spacing.cardPadding,
  },
  
  // Common animations
  animations: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeInUp: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    scaleIn: {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
  }
}
