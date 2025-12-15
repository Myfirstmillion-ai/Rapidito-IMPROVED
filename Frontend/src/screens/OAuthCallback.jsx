import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * OAuthCallback - Handles OAuth redirect from backend
 * Extracts token and user data from URL, stores them, and redirects
 */
function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Check for error in URL
        const errorParam = searchParams.get("error");
        if (errorParam) {
          setError(getErrorMessage(errorParam));
          setStatus("error");
          return;
        }

        // Extract token and user data from URL
        const token = searchParams.get("token");
        const encodedUserData = searchParams.get("userData");
        const redirect = searchParams.get("redirect") || "/home";

        if (!token) {
          setError("No se recibió el token de autenticación");
          setStatus("error");
          return;
        }

        // Store token
        localStorage.setItem("token", token);

        // Decode and store user data if present
        if (encodedUserData) {
          try {
            const userData = JSON.parse(atob(encodedUserData));
            localStorage.setItem("userData", JSON.stringify(userData));
          } catch (e) {
            console.error("Error decoding user data:", e);
          }
        }

        setStatus("success");

        // Small delay for visual feedback, then redirect
        setTimeout(() => {
          navigate(redirect, { replace: true });
        }, 1000);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("Error procesando la autenticación");
        setStatus("error");
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate]);

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      oauth_failed: "La autenticación con Google falló. Por favor, intenta de nuevo.",
      no_account: "No se pudo crear o encontrar tu cuenta.",
      callback_failed: "Error al procesar la respuesta de Google.",
      access_denied: "Acceso denegado. Por favor, autoriza la aplicación.",
    };
    return errorMessages[errorCode] || "Error de autenticación desconocido";
  };

  const handleRetry = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        {status === "processing" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Autenticando...
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Estamos verificando tu cuenta de Google
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 mx-auto mb-6 bg-emerald-500 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Bienvenido!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Redirigiendo a tu cuenta...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error de autenticación
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
            >
              Volver a intentar
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default OAuthCallback;
