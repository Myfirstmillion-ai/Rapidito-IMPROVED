import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Car } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import Console from "../utils/console";
import MembershipRequiredModal from "../components/MembershipRequiredModal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

/**
 * CaptainLogin - Premium Uber-style Driver Login Screen
 * Clean, modern design with smooth animations
 */
function CaptainLogin() {
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (responseError) {
      const timer = setTimeout(() => setResponseError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [responseError]);

  const loginCaptain = async (data) => {
    if (!data.email?.trim() || !data.password?.trim()) return;

    try {
      setLoading(true);
      setResponseError("");

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/captain/login`,
        data
      );

      Console.log(response);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          type: "captain",
          data: response.data.captain,
        })
      );

      setTimeout(() => navigate("/captain/home"), 300);
    } catch (error) {
      if (
        error.response?.status === 403 &&
        error.response?.data?.error === "MEMBERSHIP_REQUIRED"
      ) {
        setShowMembershipModal(true);
      } else {
        setResponseError(
          error.response?.data?.message || "Error al iniciar sesión"
        );
      }
      Console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Green accent bar */}
      <div style={styles.accentBar} />

      {/* Header with back button */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={styles.header}
      >
        <button
          onClick={() => navigate("/")}
          style={styles.backButton}
          aria-label="Volver"
        >
          <ArrowLeft size={24} color="#000" />
        </button>
      </motion.header>

      {/* Main content */}
      <div style={styles.content}>
        {/* Driver badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.9 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={styles.badgeContainer}
        >
          <div style={styles.driverBadge}>
            <Car size={16} color="#16A34A" strokeWidth={2.5} />
            <span style={styles.badgeText}>CONDUCTOR</span>
          </div>
        </motion.div>

        {/* Title section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={styles.titleSection}
        >
          <h1 style={styles.title}>Hola, conductor</h1>
          <p style={styles.subtitle}>Inicia sesión para comenzar a ganar</p>
        </motion.div>

        {/* Error message */}
        {responseError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.errorContainer}
          >
            <p style={styles.errorText}>{responseError}</p>
          </motion.div>
        )}

        {/* Login form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit(loginCaptain)}
          style={styles.form}
        >
          {/* Email input */}
          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            icon={Mail}
            register={register}
            error={errors.email && { message: "El email es requerido" }}
            floatingLabel
            clearable
          />

          {/* Password input */}
          <div style={styles.passwordContainer}>
            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              name="password"
              icon={Lock}
              register={register}
              error={
                errors.password && { message: "La contraseña es requerida" }
              }
              floatingLabel
              clearable={false}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.showPasswordButton}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </button>
          </div>

          {/* Forgot password link */}
          <div style={styles.forgotPasswordContainer}>
            <Link
              to="/captain/forgot-password"
              style={styles.forgotPasswordLink}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Submit button */}
          <div style={styles.buttonContainer}>
            <Button
              type="submit"
              variant="primary"
              size="large"
              title={loading ? "Iniciando sesión..." : "Iniciar sesión"}
              loading={loading}
              loadingMessage="Iniciando..."
              fullWidth
            />
          </div>
        </motion.form>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={styles.divider}
        >
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>o</span>
          <div style={styles.dividerLine} />
        </motion.div>

        {/* Google button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
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
              window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google?userType=captain`;
            }}
            fullWidth
          />
        </motion.div>

        {/* Links section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={styles.linksSection}
        >
          <p style={styles.signupText}>
            ¿No tienes cuenta?{" "}
            <Link to="/captain/signup" style={styles.signupLink}>
              Regístrate como conductor
            </Link>
          </p>
          <p style={styles.switchText}>
            ¿Quieres viajar?{" "}
            <Link to="/login" style={styles.switchLink}>
              Iniciar como pasajero
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={styles.footer}
      >
        <div style={styles.footerLinks}>
          <Link to="/terms" style={styles.footerLink}>
            Términos
          </Link>
          <span style={styles.footerDot}>·</span>
          <Link to="/privacy" style={styles.footerLink}>
            Privacidad
          </Link>
          <span style={styles.footerDot}>·</span>
          <Link to="/help" style={styles.footerLink}>
            Ayuda
          </Link>
        </div>
      </motion.footer>

      {/* Membership Required Modal */}
      <MembershipRequiredModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
      />
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #16A34A 0%, #22C55E 100%)",
  },
  header: {
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
  },
  backButton: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  content: {
    flex: 1,
    padding: "0 24px",
    display: "flex",
    flexDirection: "column",
  },
  badgeContainer: {
    marginBottom: "16px",
  },
  driverBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#F0FDF4",
    borderRadius: "100px",
    border: "1px solid #BBF7D0",
  },
  badgeText: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#16A34A",
    letterSpacing: "0.5px",
  },
  titleSection: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6B7280",
  },
  errorContainer: {
    padding: "12px 16px",
    backgroundColor: "#FEF2F2",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  errorText: {
    fontSize: "14px",
    color: "#DC2626",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  passwordContainer: {
    position: "relative",
  },
  showPasswordButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  forgotPasswordContainer: {
    textAlign: "right",
    marginTop: "8px",
    marginBottom: "24px",
  },
  forgotPasswordLink: {
    fontSize: "14px",
    color: "#000000",
    fontWeight: "500",
    textDecoration: "none",
  },
  buttonContainer: {
    marginTop: "8px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: "14px",
    color: "#9CA3AF",
  },
  linksSection: {
    textAlign: "center",
    marginTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  signupText: {
    fontSize: "15px",
    color: "#6B7280",
  },
  signupLink: {
    color: "#000000",
    fontWeight: "600",
    textDecoration: "none",
  },
  switchText: {
    fontSize: "14px",
    color: "#9CA3AF",
  },
  switchLink: {
    color: "#16A34A",
    fontWeight: "500",
    textDecoration: "none",
  },
  footer: {
    padding: "24px",
    textAlign: "center",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  },
  footerLink: {
    fontSize: "14px",
    color: "#6B7280",
    textDecoration: "none",
  },
  footerDot: {
    color: "#D1D5DB",
  },
};

export default CaptainLogin;
