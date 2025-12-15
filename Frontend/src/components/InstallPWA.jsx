import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';
import persistenceManager from '../utils/persistenceManager';

/**
 * InstallPWA - A stylish iOS Deluxe style PWA installation prompt
 * Shows when the app is installable and provides a mechanism to trigger installation
 */
function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [installable, setInstallable] = useState(false);
  const [visibilityDelay, setVisibilityDelay] = useState(false);

  useEffect(() => {
    // Check if the user has previously dismissed the install prompt
    const isDismissed = persistenceManager.ui.wasInstallPromptDismissed();
    
    // If already dismissed, don't show
    if (isDismissed) return;

    // Check if installed via display-mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone || // iOS
      document.referrer.includes('android-app://');
    
    // If already installed, don't show prompt
    if (isStandalone) return;

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
      setInstallable(true);
    };

    // Set up delay for showing the prompt (30 seconds)
    const showDelay = setTimeout(() => {
      setVisibilityDelay(true);
    }, 30000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Clean up
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(showDelay);
    };
  }, []);

  // When both installable and delay timer completes, show the prompt
  useEffect(() => {
    if (installable && visibilityDelay) {
      setIsVisible(true);
    }
  }, [installable, visibilityDelay]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    try {
      // Wait for the user to respond to the prompt
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // Hide the install button after acceptance
        setIsVisible(false);
        setInstallable(false);
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error with install prompt:', error);
    }
    
    // Clear the saved prompt since it can't be used again
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    // Hide the prompt
    setIsVisible(false);
    
    // Save the dismissal in persistence
    persistenceManager.ui.saveInstallPromptDismissed(true);
  };

  // Don't render anything if not visible
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ 
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="flex items-center p-4 pr-6 bg-black/80 backdrop-blur-lg border border-white/20 rounded-full shadow-xl">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full mr-3">
              <Smartphone size={24} className="text-white" />
            </div>
            <div className="mr-4">
              <h3 className="font-semibold text-white text-sm">Instalar App</h3>
              <p className="text-gray-300 text-xs">Accede más rápido</p>
            </div>
            <button
              onClick={handleInstallClick}
              className="bg-white text-black font-semibold text-sm py-2 px-4 rounded-full flex items-center"
            >
              <Download size={16} className="mr-1" />
              Instalar
            </button>
          </div>
          <button 
            onClick={handleDismiss} 
            className="ml-3 text-white/70 hover:text-white"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default InstallPWA;
