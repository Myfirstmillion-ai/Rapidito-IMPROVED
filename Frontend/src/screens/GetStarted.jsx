import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, ArrowRight } from "lucide-react";
import { colors, borderRadius, shadows, glassEffect } from "../styles/designSystem";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";

/**
 * GetStarted - iOS Deluxe Floating Island Landing
 * Premium dark mode design with glassmorphism
 * Animated gradient background with floating islands
 */
function GetStarted() {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Animation variants with iOS spring physics
  const fadeInUp = {
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 40 },
    animate: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 }
  };

  const cardReveal = {
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 100 },
    animate: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
    transition: { type: "spring", damping: 25, stiffness: 250, mass: 0.8, delay: 0.3 }
  };
  
  const scaleIn = {
    initial: prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 },
    animate: prefersReducedMotion ? {} : { opacity: 1, scale: 1 },
    transition: { type: "spring", damping: 35, stiffness: 350, mass: 0.6, delay: 0.6 }
  };
  
  useEffect(() => {
    // Ensure scroll is never blocked
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Check for existing user session
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData.type === "user") {
          navigate("/home");
        } else if (parsedData.type === "captain") {
          navigate("/captain/home");
        }
      } catch {
        // Invalid data, continue to landing page
      }
    }

    // Preload hero background image
    const img = new Image();
    img.src = '/IMG_3639.jpeg';
    img.onload = () => setImageLoaded(true);
    
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [navigate]);

  return (
    <div className={`relative h-screen w-full overflow-hidden bg-[${colors.primary}]`}>
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#080808] opacity-90" />
      
      {/* Subtle Mesh Gradient Overlay */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: imageLoaded ? 0.7 : 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-[url('/2.webp')] bg-cover bg-center opacity-30 mix-blend-overlay"
        aria-hidden="true"
      />
      
      {/* City Background Image with Blur Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 0.5 : 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `url('/IMG_3639.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px) brightness(0.3)',
        }}
        aria-hidden="true"
      />
      
      {/* Content Wrapper */}
      <div className="relative z-10 h-full flex flex-col justify-between px-6 py-12 md:px-8 md:py-16 lg:px-12">
        {/* Header Logo - Floating Island */}
        <motion.header
          {...fadeInUp}
          className="flex justify-center md:justify-start"
        >
          <Card 
            variant="glass" 
            borderRadius="xlarge"
            className="inline-flex px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          >
            {/* RAPIDITO Logo - Premium styling */}
            <div 
              className="font-bold tracking-[0.2em] uppercase text-white"
              role="img"
              aria-label="RAPIDITO"
            >
              <span className="text-2xl md:text-3xl">RAPIDITO</span>
            </div>
          </Card>
        </motion.header>

        {/* Hero Section - Centered Content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto text-center">
          {/* Hero Text Floating Island */}
          <motion.div
            {...fadeInUp}
            className="mb-8"
          >
            <Card 
              variant="glass" 
              borderRadius="xlarge"
              className="px-8 py-6 md:py-8 md:px-12 shadow-[${shadows.level4}]"
            >
              {/* Tagline */}
              <Badge 
                variant="primary" 
                size="small"
                className="mb-6"
              >
                PREMIUM EXPERIENCE
              </Badge>
              
              {/* Main heading with premium styling */}
              <h1 className={`text-balance text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[${colors.textPrimary}] mb-4`}>
                Una nueva forma<br />de viajar
              </h1>
              
              {/* Subheading with premium styling */}
              <p className={`text-balance text-base md:text-lg leading-relaxed text-[${colors.textSecondary}]`}>
                Seguridad, confort y estilo premium en<br />San Antonio del Táchira.
              </p>
            </Card>
          </motion.div>
          
          {/* CTA Buttons - Floating Island */}
          <motion.div
            {...scaleIn}
            className="w-full max-w-md"
          >
            <Card
              variant="floating"
              borderRadius="xlarge"
              className="px-8 py-6 flex flex-col gap-4"
            >
              {/* Google OAuth Button */}
              <Button
                variant="glass"
                size="large"
                icon={<img src="/screens/google-logo.png" alt="Google" className="w-5 h-5" />}
                title="Continuar con Google"
                onClick={() => navigate("/oauth/google")}
                fullWidth
              />
              
              {/* Divider with text */}
              <div className="flex items-center gap-4 my-2">
                <div className={`h-px flex-1 bg-[${colors.border}]`}></div>
                <span className={`text-[${colors.textSecondary}] text-sm`}>o continuar con email</span>
                <div className={`h-px flex-1 bg-[${colors.border}]`}></div>
              </div>
              
              {/* Primary CTA Button */}
              <Button
                variant="primary"
                size="large"
                icon={<ArrowRight size={20} />}
                title="Iniciar sesión"
                onClick={() => navigate("/login")}
                fullWidth
              />
              
              {/* Secondary CTA */}
              <Button
                variant="secondary"
                size="large"
                title="Conducir con Rapidito"
                onClick={() => navigate("/captain/login")}
                fullWidth
              />
            </Card>
          </motion.div>
        </div>
        
        {/* Footer with Legal Links */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-auto pt-6 flex flex-col items-center"
        >
          {/* Legal Links in Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Badge variant="ghost">
              <Link to="/privacy" className="px-1">
                Privacidad
              </Link>
            </Badge>
            <Badge variant="ghost">
              <Link to="/terms" className="px-1">
                Términos
              </Link>
            </Badge>
            <Badge variant="ghost">
              <Link to="/help" className="px-1">
                Ayuda
              </Link>
            </Badge>
          </div>
          
          {/* Signature */}
          <p className={`text-center text-sm text-[${colors.textSecondary}]`}>
            Hecho con <span className="text-red-500">♥️</span> y{' '}
            <span className="text-amber-600">☕️</span> por Camilo González
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default GetStarted;
