import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import Console from "../utils/console";

// Import design system components
import { colors, shadows, glassEffect, borderRadius } from "../styles/designSystem";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Badge from "../components/common/Badge";

/**
 * UserSignup - iOS Deluxe Floating Island Layout
 * Premium dark mode design with glassmorphism and depth layers
 * Multi-field signup form with iOS-style floating inputs
 */
function UserSignup() {
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Animation variants with iOS spring physics
  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.2
      }
    }
  };

  const fadeInUp = {
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 40 },
    animate: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 }
  };

  const scaleIn = {
    initial: prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 },
    animate: prefersReducedMotion ? {} : { opacity: 1, scale: 1 },
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8, delay: 0.1 }
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const navigation = useNavigate();
  
  const signupUser = async (data) => {
    if (!termsAccepted) {
      setResponseError("Debes aceptar los Términos y Condiciones");
      return;
    }

    const userData = {
      fullname: {
        firstname: data.firstname,
        lastname: data.lastname,
      },
      email: data.email,
      password: data.password,
      phone: data.phone
    };

    try {
      setLoading(true);
      setResponseError(""); // Clear previous errors
      
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/register`,
        userData
      );
      Console.log(response);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userData", JSON.stringify({
        type: "user",
        data: response.data.user,
      }));
      
      // Add a small delay for a smoother transition
      setTimeout(() => {
        navigation("/home");
      }, 300);
    } catch (error) {
      setResponseError(error.response?.data?.[0]?.msg || error.response?.data?.message || "Error al registrarse");
      Console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (responseError) {
      const timer = setTimeout(() => {
        setResponseError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [responseError]);

  return (
    <div className={`min-h-screen bg-[${colors.primary}] flex flex-col overflow-y-auto`}>
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#080808] opacity-90" />
      
      {/* Subtle Mesh Gradient Overlay */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-[url('/2.webp')] bg-cover bg-center opacity-30 mix-blend-overlay"
        aria-hidden="true"
      />
      
      {/* Back Button - Floating Glass Pill */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300, delay: 0.1 }}
        className="absolute top-6 left-6 z-20"
      >
        <Button
          variant="glass"
          size="small"
          icon={<ArrowLeft size={18} />}
          title="Volver"
          onClick={() => navigation('/')}
          fullWidth={false}
        />
      </motion.div>

      {/* Content Wrapper - Centered Signup Island */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-10">
        {/* Centered Floating Island Card */}
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          className="w-full max-w-md"
        >
          <Card 
            variant="floating" 
            borderRadius="xlarge"
            className="py-10 px-8"
          >
            {/* Header with Title */}
            <div className="flex flex-col items-center mb-8">
              <motion.div variants={fadeInUp} className="mb-4">
                <Badge 
                  variant="primary" 
                  size="medium"
                  icon={<UserPlus size={16} />}
                  className="mb-3"
                >
                  NUEVO USUARIO
                </Badge>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="text-center">
                <h2 className={`text-[28px] font-bold tracking-tight text-[${colors.textPrimary}]`}>Crear Cuenta</h2>
                <p className={`mt-2 text-[${colors.textSecondary}]`}>Comienza tu viaje con Rapidito</p>
              </motion.div>
            </div>

            {/* Error Message - iOS Style */}
            {responseError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 px-4 py-3 bg-[${colors.error}]/10 border border-[${colors.error}]/20 rounded-[${borderRadius.medium}] text-[${colors.error}] text-sm flex items-center gap-2`}
                role="alert"
              >
                <span className="rounded-full bg-[${colors.error}]/20 p-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {responseError}
              </motion.div>
            )}

            {/* Google OAuth Button - iOS Glass Style */}
            <motion.div variants={fadeInUp} className="mb-4">
              <Button
                variant="glass"
                size="large"
                icon={<img src="/screens/google-logo.png" alt="Google" className="w-5 h-5" />}
                title="Continuar con Google"
                onClick={() => window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google?userType=user`}
                fullWidth
              />
            </motion.div>

            {/* Divider with text */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4 my-6">
              <div className={`h-px flex-1 bg-[${colors.border}]`}></div>
              <span className={`text-[${colors.textSecondary}] text-sm`}>o registrarse con email</span>
              <div className={`h-px flex-1 bg-[${colors.border}]`}></div>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit(signupUser)} className="space-y-5">
              {/* First Name Input - iOS Floating Label */}
              <motion.div variants={fadeInUp}>
                <Input
                  label="Nombre"
                  type="text"
                  name="firstname"
                  icon={User}
                  register={register}
                  error={errors.firstname && { message: "El nombre es requerido" }}
                  floatingLabel
                  clearable
                />
              </motion.div>

              {/* Last Name Input - iOS Floating Label */}
              <motion.div variants={fadeInUp}>
                <Input
                  label="Apellido"
                  type="text"
                  name="lastname"
                  icon={User}
                  register={register}
                  error={errors.lastname && { message: "El apellido es requerido" }}
                  floatingLabel
                  clearable
                />
              </motion.div>

              {/* Email Input - iOS Floating Label */}
              <motion.div variants={fadeInUp}>
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
              </motion.div>

              {/* Phone Input - iOS Floating Label */}
              <motion.div variants={fadeInUp}>
                <Input
                  label="Teléfono"
                  type="tel"
                  name="phone"
                  icon={Phone}
                  register={register}
                  error={errors.phone && { message: "El teléfono es requerido" }}
                  floatingLabel
                  clearable
                />
              </motion.div>

              {/* Password Input - iOS Floating Label */}
              {/* CRITICAL-FIX: Pass register function, not result of calling it */}
              <motion.div variants={fadeInUp} className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  icon={Lock}
                  register={register}
                  error={errors.password && {
                    message: errors.password.type === "minLength"
                      ? "La contraseña debe tener al menos 6 caracteres"
                      : "La contraseña es requerida"
                  }}
                  floatingLabel
                  clearable={false}
                />
                
                {/* Show/Hide Password Button */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`text-[${colors.textSecondary}] hover:text-[${colors.textPrimary}] p-1 rounded-full transition-colors`}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              {/* Terms Checkbox - iOS Style */}
              <motion.div variants={fadeInUp} className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="peer appearance-none h-[22px] w-[22px] rounded-[6px] border border-[${colors.border}] bg-[${colors.card}] checked:bg-[${colors.accent}] checked:border-0 transition-all duration-200"
                    />
                    <svg
                      className="absolute h-[14px] w-[14px] text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className={`text-sm text-[${colors.textSecondary}]`}>
                    Acepto los{' '}
                    <Link to="/terms" className={`text-[${colors.accent}] hover:text-[${colors.accent}]/80 transition-colors`}>
                      Términos y Condiciones
                    </Link>
                    {' '}y la{' '}
                    <Link to="/privacy" className={`text-[${colors.accent}] hover:text-[${colors.accent}]/80 transition-colors`}>
                      Política de Privacidad
                    </Link>
                  </span>
                </label>
              </motion.div>
              
              {/* Signup Button */}
              <motion.div variants={fadeInUp} className="mt-8">
                <Button
                  variant="primary"
                  size="large"
                  title={loading ? "Creando cuenta..." : "Crear Cuenta"}
                  icon={loading ? null : <UserPlus size={20} />}
                  loading={loading}
                  loadingMessage="Creando cuenta..."
                  onClick={handleSubmit(signupUser)}
                  fullWidth
                />
              </motion.div>
              
              {/* Login Link */}
              <motion.div variants={fadeInUp} className="mt-6 text-center">
                <p className={`text-[${colors.textSecondary}]`}>
                  ¿Ya tienes cuenta?{" "}
                  <Link 
                    to="/login" 
                    className={`font-semibold text-[${colors.textPrimary}] hover:text-[${colors.accent}] transition-colors`}
                  >
                    Inicia sesión
                  </Link>
                </p>
              </motion.div>
            </form>

          </Card>
        </motion.div>
      </div>

      {/* Footer with Legal Links */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative z-10 mt-auto py-6 flex flex-col items-center"
      >
        {/* Legal Links in Pills */}
        <div className="flex flex-wrap justify-center gap-3">
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
      </motion.footer>
    </div>
  );
}

export default UserSignup;
