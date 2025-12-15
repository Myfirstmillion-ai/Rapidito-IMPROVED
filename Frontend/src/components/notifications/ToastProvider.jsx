import { Toaster } from "react-hot-toast";

// Z-index must match RideRequestToast for consistent supreme layering
const TOAST_Z_INDEX = 9999;

/**
 * ToastProvider with Premium iOS-Style Stacked Notifications
 * 
 * Configuration:
 * - Position: bottom-center (above minimized driver bar)
 * - Duration by type: success 3s, error 4s, custom 30s
 * - Dark glassmorphism styling
 * - Smooth spring animations for stacking effect
 * - Positioned to float above minimized driver bar (~120px from bottom)
 * - Supreme z-index (9999) ensures visibility above all panels
 */
function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      reverseOrder={false}
      gutter={12}
      containerClassName="z-[9999]"
      containerStyle={{
        bottom: '120px', // Position clearly above minimized driver bar with extra spacing for stacked look
        zIndex: TOAST_Z_INDEX, // Supreme layer - above all panels including captain details
      }}
      toastOptions={{
        duration: 4000,
        className: "z-[9999]",
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#ffffff',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
          borderRadius: '24px',
          padding: '16px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: TOAST_Z_INDEX,
        },
        success: {
          duration: 3000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            backdropFilter: 'blur(20px)',
          },
          iconTheme: {
            primary: '#10b981', // Emerald green
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            backdropFilter: 'blur(20px)',
          },
          iconTheme: {
            primary: '#ef4444', // Red
            secondary: '#fff',
          },
        },
        loading: {
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            backdropFilter: 'blur(20px)',
          },
          iconTheme: {
            primary: '#3b82f6', // Blue
            secondary: '#fff',
          },
        },
        // Custom toasts (like ride requests) have longer duration
        custom: {
          duration: 30000,
        },
      }}
    />
  );
}

export default ToastProvider;
