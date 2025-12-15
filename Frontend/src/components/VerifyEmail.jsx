import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Console from "../utils/console";
import Heading from "./Heading";
import Button from "./Button";
import useCooldownTimer from "../hooks/useCooldownTimer";
import { Alert } from "./Alert";
import { useAlert } from "../hooks/useAlert";

/**
 * Swiss Minimalist Premium VerifyEmail Component
 * 
 * Design Philosophy:
 * - Glassmorphism cards with backdrop-blur
 * - Emerald gradient CTAs
 * - Smooth spring animations
 * - Icon-driven visual hierarchy
 * - Dark mode support
 * 
 * @param {Object} user - User data
 * @param {string} role - User role (user/captain)
 */
function VerifyEmail({ user, role }) {
  const navigation = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const { alert, showAlert, hideAlert } = useAlert();
  const { timeLeft, isActive, startCooldown } = useCooldownTimer(60000, 'forgot-password-cooldown');

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/mail/verify-${role}-email`,
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.status === 200) {
        showAlert(
          '¡Email enviado!', 
          'Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación.', 
          'success'
        );
        startCooldown();
      }
    } catch (error) {
      showAlert(
        'Error al enviar', 
        error.response?.data?.message || 'No se pudo enviar el email de verificación', 
        'failure'
      );
      Console.error("Error sending verification email:", error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonTitle = () => {
    if (isActive) {
      return `Espera ${timeLeft}s`;
    }
    return "Enviar Email de Verificación";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-gray-950 dark:via-emerald-950/30 dark:to-gray-950 flex flex-col">
      <Alert
        heading={alert.heading}
        text={alert.text}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        type={alert.type}
      />

      {/* Header with Back Button */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-6 px-4"
      >
        <button
          onClick={() => navigation(-1)}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 flex items-center justify-center transition-all duration-200 group-hover:bg-white dark:group-hover:bg-white/20 group-hover:scale-105 shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            Volver
          </span>
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            damping: 28,
            stiffness: 350,
            mass: 0.8,
          }}
          className="w-full max-w-md"
        >
          {/* Glass Card */}
          <div 
            className="rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden relative"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
          >
            {/* Subtle top accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

            <div className="p-8 text-center">
              {/* Icon Badge */}
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 300,
                  delay: 0.2,
                }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 dark:from-emerald-400/20 dark:to-emerald-500/20 border-4 border-white/50 dark:border-black/20 mb-6 shadow-lg shadow-emerald-500/20"
              >
                <Mail className="w-12 h-12 text-emerald-500 dark:text-emerald-400" strokeWidth={2} />
              </motion.div>

              {/* Greeting */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="mb-2"
              >
                <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                  Hola, {user?.fullname?.firstname || 'Usuario'}
                </p>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mb-6"
              >
                <Heading 
                  title="Verifica tu Email" 
                  level="h2"
                  className="mb-0"
                />
              </motion.div>

              {/* Email Badge */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 mb-6"
              >
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-[250px]">
                  {user?.email || 'email@ejemplo.com'}
                </span>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-8"
                style={{ textWrap: 'balance' }}
              >
                Haz clic en el botón para enviar un enlace de verificación a tu correo electrónico y activar tu cuenta.
              </motion.p>

              {/* Action Button */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <Button
                  title={getButtonTitle()}
                  fun={sendVerificationEmail}
                  loading={loading}
                  loadingMessage="Enviando..."
                  disabled={loading || isActive}
                  variant="primary"
                  icon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                />
              </motion.div>

              {/* Cooldown Info */}
              {isActive && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-xs text-gray-500 dark:text-gray-400"
                >
                  Podrás reenviar el email en {timeLeft} segundos
                </motion.p>
              )}
            </div>
          </div>

          {/* Help Text */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
            className="mt-6 text-center px-4"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¿No recibiste el email? Revisa tu carpeta de spam
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default VerifyEmail;