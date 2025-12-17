import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Car, User, Shield, Clock, MapPin } from "lucide-react";
import Button from "../components/common/Button";

/**
 * GetStarted - Premium Uber-style Landing Screen
 * Clean, modern design with bold typography and smooth animations
 */
function GetStarted() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

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
  }, [navigate]);

  const features = [
    { icon: Shield, text: "Viajes seguros" },
    { icon: Clock, text: "Llegamos en minutos" },
    { icon: MapPin, text: "Cobertura total" },
  ];

  return (
    <div style={styles.container}>
      {/* Background gradient */}
      <div style={styles.backgroundGradient} />

      {/* Main content */}
      <div style={styles.content}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={styles.header}
        >
          <div style={styles.logo}>
            <span style={styles.logoText}>Rapidito</span>
          </div>
        </motion.header>

        {/* Hero Section */}
        <div style={styles.heroSection}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 style={styles.heroTitle}>
              Tu viaje,{" "}
              <span style={styles.heroHighlight}>simplificado</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Solicita un viaje en segundos. Llega a donde necesites de forma
              segura y confiable.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={styles.features}
          >
            {features.map((feature, index) => (
              <div key={index} style={styles.featureItem}>
                <feature.icon size={18} color="#000" strokeWidth={2.5} />
                <span style={styles.featureText}>{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 40 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={styles.actionSection}
        >
          {/* User type selection */}
          <div style={styles.userTypeSection}>
            <p style={styles.selectLabel}>Selecciona tu perfil</p>

            {/* Rider option */}
            <button
              style={styles.userTypeCard}
              onClick={() => navigate("/login")}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.transform = 'scale(1.01)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={styles.userTypeIcon}>
                <User size={24} color="#000" strokeWidth={2} />
              </div>
              <div style={styles.userTypeContent}>
                <h3 style={styles.userTypeTitle}>Pasajero</h3>
                <p style={styles.userTypeDesc}>Solicita un viaje ahora</p>
              </div>
              <ArrowRight size={20} color="#9CA3AF" />
            </button>

            {/* Driver option */}
            <button
              style={styles.userTypeCard}
              onClick={() => navigate("/captain/login")}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.transform = 'scale(1.01)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={styles.userTypeIcon}>
                <Car size={24} color="#000" strokeWidth={2} />
              </div>
              <div style={styles.userTypeContent}>
                <h3 style={styles.userTypeTitle}>Conductor</h3>
                <p style={styles.userTypeDesc}>Genera ingresos manejando</p>
              </div>
              <ArrowRight size={20} color="#9CA3AF" />
            </button>
          </div>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>o</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Google Sign In */}
          <Button
            variant="secondary"
            size="large"
            icon={
              <img
                src="/screens/google-logo.png"
                alt="Google"
                style={{ width: 20, height: 20 }}
              />
            }
            title="Continuar con Google"
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google?userType=user`;
            }}
            fullWidth
          />
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={styles.footer}
        >
          <div style={styles.footerLinks}>
            <Link to="/terms" style={styles.footerLink}>Términos</Link>
            <span style={styles.footerDot}>·</span>
            <Link to="/privacy" style={styles.footerLink}>Privacidad</Link>
            <span style={styles.footerDot}>·</span>
            <Link to="/help" style={styles.footerLink}>Ayuda</Link>
          </div>
          <p style={styles.footerCopyright}>
            © 2024 Rapidito. San Antonio del Táchira.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    maxWidth: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: '32px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#000000',
    letterSpacing: '-0.5px',
  },
  heroSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '24px',
  },
  heroTitle: {
    fontSize: '40px',
    fontWeight: '700',
    color: '#000000',
    lineHeight: 1.1,
    marginBottom: '16px',
    letterSpacing: '-1px',
  },
  heroHighlight: {
    color: '#16A34A',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#6B7280',
    lineHeight: 1.5,
    marginBottom: '32px',
    maxWidth: '320px',
  },
  features: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#F3F4F6',
    borderRadius: '100px',
  },
  featureText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingBottom: '24px',
  },
  userTypeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  selectLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: '4px',
  },
  userTypeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%',
  },
  userTypeIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userTypeContent: {
    flex: 1,
  },
  userTypeTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '2px',
  },
  userTypeDesc: {
    fontSize: '14px',
    color: '#6B7280',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '8px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: '14px',
    color: '#9CA3AF',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '16px',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  footerLink: {
    fontSize: '14px',
    color: '#6B7280',
    textDecoration: 'none',
  },
  footerDot: {
    color: '#D1D5DB',
  },
  footerCopyright: {
    fontSize: '12px',
    color: '#9CA3AF',
  },
};

export default GetStarted;
