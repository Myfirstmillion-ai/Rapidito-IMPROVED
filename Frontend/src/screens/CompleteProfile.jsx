import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import axios from "axios";
import { 
  User, 
  Phone, 
  Car, 
  Palette, 
  Hash, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  ShieldCheck
} from "lucide-react";

// Import design system components
import { colors, shadows, glassEffect, borderRadius } from "../styles/designSystem";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Badge from "../components/common/Badge";

/**
 * CompleteProfile - iOS Deluxe Floating Island Layout
 * Premium dark mode design with glassmorphism and depth layers
 * Multi-step form with iOS-style floating inputs and progress indicators
 */
function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState("user");

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstname: "",
      lastname: "",
      phone: "",
      vehicleType: "car",
      vehicleColor: "",
      vehiclePlate: "",
      vehicleCapacity: 4,
      vehicleBrand: "",
      vehicleModel: "",
    },
  });

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setUserData(parsed.data);
        setUserType(parsed.type || "user");
        if (parsed.data?.fullname) {
          setValue("firstname", parsed.data.fullname.firstname || "");
          setValue("lastname", parsed.data.fullname.lastname || "");
        }
        if (parsed.data?.phone) {
          setValue("phone", parsed.data.phone);
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, [setValue]);

  const totalSteps = userType === "captain" ? 2 : 1;

  const handleNextStep = async () => {
    const fieldsToValidate =
      currentStep === 1
        ? ["firstname", "lastname", "phone"]
        : ["vehicleType", "vehicleColor", "vehiclePlate", "vehicleCapacity"];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        fullname: {
          firstname: data.firstname,
          lastname: data.lastname,
        },
        phone: data.phone,
      };

      if (userType === "captain") {
        payload.vehicle = {
          type: data.vehicleType,
          color: data.vehicleColor,
          number: data.vehiclePlate,
          capacity: parseInt(data.vehicleCapacity),
          brand: data.vehicleBrand || "",
          model: data.vehicleModel || "",
        };
      }

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/profile/complete`,
        payload,
        { headers: { token } }
      );

      if (response.data.success) {
        const updatedUser = response.data[userType];
        localStorage.setItem(
          "userData",
          JSON.stringify({ type: userType, data: updatedUser })
        );
        navigate(userType === "captain" ? "/captain/home" : "/home");
      }
    } catch (err) {
      console.error("Error completing profile:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          "Error al completar el perfil"
      );
    } finally {
      setLoading(false);
    }
  };

  const vehicleTypes = [
    { value: "car", label: "Carro", icon: "🚗" },
    { value: "bike", label: "Moto", icon: "🏍️" },
  ];

  // This component is no longer needed as we're using the custom Input component
  // but we'll keep it commented for reference
  /*
  const InputField = ({ icon: Icon, label, name, type = "text", placeholder, validation, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          {...register(name, validation)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
            errors[name]
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-200 dark:border-gray-700"
          }`}
          {...props}
        />
      </div>
      {errors[name] && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {errors[name].message}
        </p>
      )}
    </div>
  );
  */

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

  const panelTransition = {
    initial: prefersReducedMotion ? {} : { opacity: 0, x: 20, scale: 0.98 },
    animate: prefersReducedMotion ? {} : { opacity: 1, x: 0, scale: 1 },
    exit: prefersReducedMotion ? {} : { opacity: 0, x: -20, scale: 0.95 },
    transition: { type: "spring", damping: 25, stiffness: 250, mass: 0.8 }
  };
  
  return (
    <div className={`min-h-screen bg-[${colors.primary}] flex flex-col items-center justify-center p-4 overflow-y-auto`}>
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
      
      {/* Content Container */}
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md"
      >
        <Card
          variant="floating"
          borderRadius="xlarge"
          className="py-10 px-8"
        >
          {/* Header with Badge and Title */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            {/* Profile Badge */}
            <div className="flex flex-col items-center mb-5">
              <motion.div 
                initial={prefersReducedMotion ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-5"
              >
                {userData?.profileImage ? (
                  <div className={`w-[90px] h-[90px] rounded-full overflow-hidden border-2 border-[${colors.accent}] p-1 shadow-lg shadow-[${colors.accent}]/20`}>
                    <img
                      src={userData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <div className={`w-20 h-20 rounded-full bg-[${colors.accent}]/10 flex items-center justify-center text-[${colors.accent}]`}>
                    <ShieldCheck size={36} />
                  </div>
                )}
              </motion.div>
              
              <Badge 
                variant={userType === "captain" ? "primary" : "success"} 
                size="medium"
                icon={userType === "captain" ? <Car size={16} /> : <User size={16} />}
                className="mb-4"
              >
                {userType === "captain" ? "CONDUCTOR" : "PASAJERO"}
              </Badge>
            </div>
            
            <h2 className={`text-[28px] font-bold tracking-tight text-[${colors.textPrimary}]`}>
              Completa tu perfil
            </h2>
            <p className={`mt-2 text-[${colors.textSecondary}]`}>
              {userType === "captain"
                ? "Necesitamos algunos datos adicionales para activar tu cuenta de conductor"
                : "Agrega tu número de teléfono para continuar"}
            </p>
          </motion.div>

          {/* iOS Style Progress Indicator for Captain */}
          {userType === "captain" && (
            <motion.div 
              variants={fadeInUp}
              className="flex items-center gap-4 mb-8 px-4"
            >
              {/* Step 1 - Personal Info */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${currentStep === 1 ? `bg-[${colors.accent}]` : `bg-[${colors.accent}]/20`} flex items-center justify-center mb-2 transition-all duration-300 shadow-lg`}>
                  <User className={`w-5 h-5 ${currentStep === 1 ? 'text-white' : `text-[${colors.accent}]`}`} />
                </div>
                <span className={`text-xs ${currentStep === 1 ? `text-[${colors.textPrimary}]` : `text-[${colors.textSecondary}]`} font-medium`}>Personal</span>
              </div>
              
              {/* Progress Line */}
              <div className={`flex-1 h-[3px] relative overflow-hidden rounded-full bg-[${colors.border}]`}>
                <div 
                  className={`absolute top-0 left-0 h-full bg-[${colors.accent}] transition-all duration-500 ease-out`}
                  style={{ width: currentStep > 1 ? '100%' : '0%' }}
                />
              </div>
              
              {/* Step 2 - Vehicle Info */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${currentStep === 2 ? `bg-[${colors.accent}]` : `bg-[${colors.accent}]/10`} flex items-center justify-center mb-2 transition-all duration-300`}>
                  <Car className={`w-5 h-5 ${currentStep === 2 ? 'text-white' : `text-[${colors.accent}]/70`}`} />
                </div>
                <span className={`text-xs ${currentStep === 2 ? `text-[${colors.textPrimary}]` : `text-[${colors.textSecondary}]`} font-medium`}>Vehículo</span>
              </div>
            </motion.div>
          )}

          {/* Error Message - iOS Style */}
          {error && (
            <motion.div
              variants={fadeInUp}
              className={`mb-6 px-4 py-3 bg-[${colors.error}]/10 border border-[${colors.error}]/20 rounded-[${borderRadius.medium}] text-[${colors.error}] text-sm flex items-center gap-2`}
              role="alert"
            >
              <span className="rounded-full bg-[${colors.error}]/20 p-1">
                <AlertCircle size={14} />
              </span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  className="space-y-5"
                >
                  {/* Personal Info Form */}
                  <div className="space-y-5">
                    {/* First Name Input - iOS Floating Label */}
                    <motion.div variants={fadeInUp}>
                      <Input
                        label="Nombre"
                        type="text"
                        name="firstname"
                        icon={User}
                        register={register("firstname", {
                          required: "El nombre es requerido",
                          minLength: { value: 2, message: "Mínimo 2 caracteres" },
                        })}
                        error={errors.firstname && { message: errors.firstname.message }}
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
                        register={register("lastname", {
                          required: "El apellido es requerido",
                          minLength: { value: 2, message: "Mínimo 2 caracteres" },
                        })}
                        error={errors.lastname && { message: errors.lastname.message }}
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
                        register={register("phone", {
                          required: "El teléfono es requerido",
                          pattern: {
                            value: /^[0-9]{10,15}$/,
                            message: "Ingresa un número válido (10-15 dígitos)",
                          },
                        })}
                        error={errors.phone && { message: errors.phone.message }}
                        floatingLabel
                        clearable
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && userType === "captain" && (
                <motion.div
                  key="step2"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  className="space-y-5"
                >
                  {/* Vehicle Info Section */}
                  <motion.div variants={fadeInUp} className="mb-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2 rounded-full bg-[${colors.accent}]/10 text-[${colors.accent}]`}>
                        <Car size={20} />
                      </div>
                      <h3 className={`text-lg font-semibold text-[${colors.textPrimary}]`}>Información del vehículo</h3>
                    </div>
                  </motion.div>
                  
                  {/* Vehicle Type Selection - iOS Style */}
                  <motion.div variants={fadeInUp} className="mb-5">
                    <label className={`block text-sm font-medium text-[${colors.textSecondary}] mb-2 ml-1`}>
                      Tipo de Vehículo
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {vehicleTypes.map((type) => {
                        const checked = watch("vehicleType") === type.value;
                        return (
                          <label
                            key={type.value}
                            className={`flex items-center justify-center gap-2 p-4 rounded-[${borderRadius.large}] cursor-pointer transition-all duration-200 ${checked 
                              ? `bg-[${colors.accent}]/10 border border-[${colors.accent}]/30 shadow-[0_0_0_1px_${colors.accent}30]` 
                              : `bg-[${colors.card}]/50 border border-[${colors.border}]`}`}
                          >
                            <input
                              type="radio"
                              value={type.value}
                              {...register("vehicleType", {
                                required: "Selecciona un tipo",
                              })}
                              className="sr-only"
                            />
                            <span className="text-2xl">{type.icon}</span>
                            <span className={`font-medium ${checked ? `text-[${colors.accent}]` : `text-[${colors.textPrimary}]`}`}>
                              {type.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.vehicleType && (
                      <p className={`mt-1 text-sm text-[${colors.error}] flex items-center gap-1 ml-1`}>
                        <AlertCircle size={14} />
                        {errors.vehicleType.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Vehicle Color - iOS Floating Label */}
                  <motion.div variants={fadeInUp}>
                    <Input
                      label="Color del vehículo"
                      type="text"
                      name="vehicleColor"
                      icon={Palette}
                      placeholder="Ej: Rojo, Negro, Blanco"
                      register={register("vehicleColor", {
                        required: "El color es requerido",
                        minLength: { value: 3, message: "Mínimo 3 caracteres" },
                      })}
                      error={errors.vehicleColor && { message: errors.vehicleColor.message }}
                      floatingLabel
                      clearable
                    />
                  </motion.div>

                  {/* License Plate - iOS Floating Label */}
                  <motion.div variants={fadeInUp}>
                    <Input
                      label="Placa"
                      type="text"
                      name="vehiclePlate"
                      icon={Hash}
                      register={register("vehiclePlate", {
                        required: "La placa es requerida",
                        minLength: { value: 3, message: "Mínimo 3 caracteres" },
                      })}
                      error={errors.vehiclePlate && { message: errors.vehiclePlate.message }}
                      floatingLabel
                      clearable
                    />
                  </motion.div>

                  {/* Capacity - iOS Style Select */}
                  <motion.div variants={fadeInUp} className="relative">
                    <label className={`block text-sm font-medium text-[${colors.textSecondary}] mb-2 ml-1`}>
                      Capacidad de Pasajeros
                    </label>
                    <div className={`relative rounded-[${borderRadius.medium}] border border-[${colors.border}] overflow-hidden`}>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Users size={18} className={`text-[${colors.textSecondary}]`} />
                      </div>
                      <select
                        {...register("vehicleCapacity", {
                          required: "La capacidad es requerida",
                        })}
                        className={`w-full bg-[${colors.card}] pl-12 pr-12 py-3.5 text-[${colors.textPrimary}] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[${colors.accent}] transition-all duration-200`}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num} className={`bg-[${colors.card}]`}>
                            {num} {num === 1 ? "pasajero" : "pasajeros"}
                          </option>
                        ))}
                      </select>
                      <div className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-[${colors.accent}]/10 text-[${colors.accent}] pointer-events-none`}>
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Optional fields - iOS Style Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Brand Field */}
                    <motion.div variants={fadeInUp}>
                      <Input
                        label="Marca (opcional)"
                        type="text"
                        name="vehicleBrand"
                        placeholder="Ej: Toyota"
                        register={register("vehicleBrand")}
                        floatingLabel
                        clearable
                      />
                    </motion.div>
                    
                    {/* Model Field */}
                    <motion.div variants={fadeInUp}>
                      <Input
                        label="Modelo (opcional)"
                        type="text"
                        name="vehicleModel"
                        placeholder="Ej: Corolla"
                        register={register("vehicleModel")}
                        floatingLabel
                        clearable
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons - iOS Style */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <motion.div variants={fadeInUp} className="flex-1">
                  <Button
                    variant="ghost"
                    size="large"
                    icon={<ChevronLeft size={20} />}
                    title="Anterior"
                    onClick={handlePrevStep}
                    fullWidth
                  />
                </motion.div>
              )}

              {currentStep < totalSteps ? (
                <motion.div variants={fadeInUp} className="flex-1">
                  <Button
                    variant="primary"
                    size="large"
                    icon={<ChevronRight size={20} />}
                    iconPosition="right"
                    title="Siguiente"
                    onClick={handleNextStep}
                    fullWidth
                  />
                </motion.div>
              ) : (
                <motion.div variants={fadeInUp} className="flex-1">
                  <Button
                    variant="primary"
                    size="large"
                    icon={loading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                    title={loading ? "Guardando..." : "Completar Perfil"}
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                    fullWidth
                  />
                </motion.div>
              )}
            </div>
          </form>
          
          {/* Logout option - iOS Style */}
          <motion.div
            variants={fadeInUp} 
            className="text-center mt-6"
          >
            <p className={`text-sm text-[${colors.textSecondary}] mb-2`}>
              ¿No quieres continuar?
            </p>
            <Button
              variant="glass"
              size="small"
              title="Cerrar sesión"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("userData");
                navigate("/");
              }}
              fullWidth={false}
            />
          </motion.div>
          
          {/* Footer with Legal Links */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="relative z-10 mt-4 py-4 flex flex-col items-center"
          >
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="ghost">
                <a href="/privacy" className="px-1">
                  Privacidad
                </a>
              </Badge>
              <Badge variant="ghost">
                <a href="/terms" className="px-1">
                  Términos
                </a>
              </Badge>
              <Badge variant="ghost">
                <a href="/help" className="px-1">
                  Ayuda
                </a>
              </Badge>
            </div>
          </motion.footer>
        </Card>
      </motion.div>
    </div>
  );
}

export default CompleteProfile;
