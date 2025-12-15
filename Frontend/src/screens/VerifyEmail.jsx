import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [verificationStatus, setVerificationStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (token && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      verifyEmail(token);
    } else if (!token) {
      setVerificationStatus("error");
      setErrorMessage("Token de verificación no encontrado en la URL.");
    }
  }, [token]);

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (verificationStatus === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (verificationStatus === "success" && countdown === 0) {
      navigate("/");
    }
  }, [verificationStatus, countdown, navigate]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/verify-email`,
        { token: verificationToken }
      );

      if (response.status === 200) {
        setVerificationStatus("success");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setVerificationStatus("error");
      setErrorMessage(
        error.response?.data?.message ||
          "Error al verificar el correo electrónico. El token puede haber expirado o ser inválido."
      );
    }
  };

  const handleResendEmail = async () => {
    const email = searchParams.get("email");
    if (!email) {
      setResendMessage("No se proporcionó correo electrónico en la URL.");
      return;
    }

    try {
      setResending(true);
      setResendMessage("");
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/resend-verification`,
        { email }
      );

      if (response.status === 200) {
        setResendMessage(
          "¡Correo de verificación reenviado! Revisa tu bandeja de entrada."
        );
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      setResendMessage(
        error.response?.data?.message ||
          "Error al reenviar el correo de verificación."
      );
    } finally {
      setResending(false);
    }
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  // Loading State
  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Loader2 size={48} className="text-white animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verificando...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos verificando tu correo electrónico
          </p>
        </motion.div>
      </div>
    );
  }

  // Success State
  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          {/* Success Icon with Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative mx-auto mb-8"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 size={64} className="text-white" strokeWidth={3} />
            </div>
            {/* Animated Rings */}
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 border-4 border-emerald-500 rounded-full"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }}
              className="absolute inset-0 border-4 border-emerald-500 rounded-full"
            />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¡Verificación exitosa!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Tu correo electrónico ha sido verificado correctamente. Ahora
              puedes iniciar sesión y disfrutar de todos nuestros servicios.
            </p>

            {/* Countdown Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 mb-6">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                Redirigiendo automáticamente en
              </p>
              <motion.p
                key={countdown}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-bold text-emerald-600 dark:text-emerald-400"
              >
                {countdown}
              </motion.p>
            </div>

            {/* Manual Navigation Button */}
            <button
              onClick={handleNavigateHome}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group"
            >
              <span>Ir a inicio de sesión</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          {/* Error Icon */}
          <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <AlertCircle size={64} className="text-white" strokeWidth={3} />
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Error de verificación
            </h1>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-6">
              <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>

          {/* Resend Message */}
          {resendMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-2xl border ${
                resendMessage.includes("Error")
                  ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400"
                  : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
              } text-sm`}
            >
              {resendMessage}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Reenviando...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  <span>Reenviar correo de verificación</span>
                </>
              )}
            </button>

            <button
              onClick={handleNavigateHome}
              className="w-full h-14 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 group"
            >
              <span>Volver al inicio</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              ¿Necesitas ayuda?
            </p>
            <a
              href="mailto:support@rapidito.com"
              className="text-sm text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium inline-flex items-center gap-2 group"
            >
              <Mail size={16} />
              <span>Contactar soporte</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}

export default VerifyEmail;