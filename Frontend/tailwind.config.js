/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        // Existing primary (green) - keep for backward compatibility
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // UBER Design System Colors
        uber: {
          black: '#000000',
          white: '#FFFFFF',
          blue: '#276EF1',
          green: '#05A357',
          red: '#CD0A29',
          gray: {
            50: '#F6F6F6',
            100: '#EEEEEE',
            200: '#E2E2E2',
            300: '#CBCBCB',
            400: '#A8A8A8',
            500: '#8B8B8B',
            600: '#545454',
            700: '#333333',
          }
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
        // UBER shadows
        'uber-sm': '0 1px 2px rgba(0,0,0,0.05)',
        'uber-md': '0 4px 6px rgba(0,0,0,0.08)',
        'uber-lg': '0 10px 15px rgba(0,0,0,0.1)',
        'uber-xl': '0 20px 25px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
        // UBER border radius
        'uber-sm': '8px',
        'uber-md': '12px',
        'uber-lg': '16px',
        'uber-xl': '24px',
      },
      // Premium transition timing functions
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
        'accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      // Extended transition durations
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'press': 'press 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        // Swiss Minimalist Animations
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'card-reveal': 'cardReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        press: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
        // Swiss Minimalist Keyframes
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        cardReveal: {
          '0%': { opacity: '0', transform: 'translateY(100px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      minHeight: {
        'touch': '44px', // Minimum touch target
        'button': '48px', // UBER minimum button height
        'screen-dvh': '100dvh', // Dynamic viewport height
      },
      height: {
        'screen-dvh': '100dvh', // Dynamic viewport height
      },
      maxHeight: {
        'screen-dvh': '100dvh', // Dynamic viewport height
      },
      maxWidth: {
        'screen': '100vw', // Full viewport width
      },
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '100': '100',
        '200': '200',
        '300': '300',
        '400': '400',
        '500': '500',
      },
      // Safe area spacing
      padding: {
        'safe': 'env(safe-area-inset-bottom, 0px)',
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      margin: {
        'safe': 'env(safe-area-inset-bottom, 0px)',
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
    },
  },
  plugins: [],
  // Safelist critical utility classes to prevent purging
  safelist: [
    'overflow-x-hidden',
    'overflow-y-auto',
    'w-full',
    'h-full',
    'min-h-screen',
    'max-w-full',
    // Premium motion classes
    'ease-premium',
    'ease-spring',
    'duration-300',
    'duration-350',
    // Glassmorphism utilities (Process 2 - Phase 1)
    'glass-panel',
    'glass-panel-intense',
    'glass-panel-dark',
    // Text gradient utilities
    'text-gradient-emerald',
    'text-gradient-green',
    'text-gradient-dark',
    // Safe area utilities (padding)
    'pt-safe',
    'pb-safe',
    'pl-safe',
    'pr-safe',
    // Safe area utilities (margin)
    'mt-safe',
    'mb-safe',
    'ml-safe',
    'mr-safe',
    'inset-safe',
    // Shadow utilities
    'shadow-float',
    'shadow-glow-emerald',
    // Animation utilities
    'transition-spring',
    'transition-smooth',
    // Interaction utilities
    'touch-target',
    'no-select',
    'gpu-accelerated',
  ],
};

