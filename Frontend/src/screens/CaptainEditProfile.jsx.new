import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCaptain } from "../contexts/CaptainContext";
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  X, 
  Loader2, 
  User, 
  Mail, 
  Phone,
  Car as CarIcon,
  Bike as BikeIcon,
  Palette,
  Hash,
  Users,
  Package
} from "lucide-react";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";
import { Alert } from "../components";
import StarRating from "../components/ui/StarRating";
import { motion, AnimatePresence } from "framer-motion";
import { colors, shadows, glassEffect, borderRadius } from "../styles/designSystem";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";

// Variantes de animación para iOS Deluxe
const animationVariants = {
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  }
};

function CaptainEditProfile() {
  const token = localStorage.getItem("token");
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { alert, showAlert, hideAlert } = useAlert();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const { captain, setCaptain } = useCaptain();
  const navigation = useNavigate();

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showAlert('Formato no válido', 'Solo se permiten imágenes (JPEG, JPG, PNG, WEBP)', 'failure');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showAlert('Archivo muy grande', 'La imagen no debe superar 5MB', 'failure');
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image
  const handleImageUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    try {
      setUploadingImage(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/upload/captain/profile-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setCaptain({
        ...captain,
        profileImage: response.data.profileImage
      });

      showAlert('¡Foto actualizada!', 'Tu foto de perfil ha sido actualizada correctamente', 'success');
      setImagePreview(null);
      setSelectedFile(null);
    } catch (error) {
      Console.log(error);
      showAlert('Error', error.response?.data?.message || 'Error al subir la imagen', 'failure');
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete image
  const handleImageDelete = async () => {
    try {
      setUploadingImage(true);
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/upload/profile-image`,
        {
          data: { userType: 'captain' },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setCaptain({
        ...captain,
        profileImage: ''
      });

      showAlert('Foto eliminada', 'Tu foto de perfil ha sido eliminada', 'success');
      setImagePreview(null);
      setSelectedFile(null);
    } catch (error) {
      Console.log(error);
      showAlert('Error', 'Error al eliminar la imagen', 'failure');
    } finally {
      setUploadingImage(false);
    }
  };

  // Cancel selection
  const handleCancelSelection = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateUserProfile = async (data) => {
    const typeMap = {
      'carro': 'car',
      'moto': 'bike',
      'car': 'car',
      'bike': 'bike'
    };

    const captainData = {
      fullname: {
        firstname: data.firstname,
        lastname: data.lastname,
      },
      phone: data.phone,
      vehicle: {
        color: data.color,
        number: data.number,
        capacity: data.capacity,
        type: typeMap[data.type.toLowerCase()] || data.type.toLowerCase(),
        brand: data.brand || "",
        model: data.model || "",
      },
    };
    Console.log(captainData);
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/captain/update`,
        { captainData },
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log(response);
      
      const updatedCaptain = {
        ...captain,
        ...captainData
      };
      setCaptain(updatedCaptain);
      
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData) {
        userData.data = updatedCaptain;
        localStorage.setItem("userData", JSON.stringify(userData));
      }
      
      showAlert('¡Actualización exitosa!', 'Tu perfil ha sido actualizado correctamente', 'success');
      
      setTimeout(() => {
        navigation("/captain/home");
      }, 2000);
    } catch (error) {
      showAlert('Ocurrió un error', error.response?.data?.[0]?.msg || 'Error al actualizar', 'failure');
      Console.log(error.response);
      Console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setResponseError("");
    }, 5000);
  }, [responseError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#080808] overflow-y-auto">
      <Alert
        heading={alert.heading}
        text={alert.text}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        type={alert.type}
      />
      
      {/* Header - iOS Deluxe */}
      <motion.div
        variants={animationVariants.fadeInDown}
        initial="initial"
        animate="animate"
        className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10"
      >
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            variant="glass"
            size="icon"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigation(-1)}
            aria-label="Volver"
          />
          <h1 className="text-2xl font-bold text-white">
            Editar perfil
          </h1>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* Profile Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col items-center">
            {/* Image Container - iOS Deluxe Style */}
            <div className="relative mb-6">
              {/* Outer Glassmorphism Ring */}
              <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transform scale-110"></div>
              
              {/* Profile Picture Container */}
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/30 shadow-xl">
                {imagePreview || captain?.profileImage ? (
                  <img 
                    src={imagePreview || captain?.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#10B981]/70">
                    <User size={48} className="text-white" />
                  </div>
                )}
                
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 rounded-full shadow-inner-light pointer-events-none"></div>
              </div>
              
              {/* Camera Button - iOS Deluxe Style */}
              <Button
                variant="glass"
                size="icon"
                icon={<Camera size={18} />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0"
                aria-label="Cambiar imagen"
              />
            </div>
            
            {/* Rating Display */}
            {captain?.rating && (
              <div className="mb-4">
                <StarRating 
                  average={captain.rating.average} 
                  count={captain.rating.count}
                  size={18}
                />
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Action Buttons - iOS Deluxe Style */}
            {imagePreview && selectedFile && (
              <div className="flex gap-4 w-full max-w-sm mt-4">
                <Button
                  variant="glass"
                  size="large"
                  title="Cancelar"
                  onClick={handleCancelSelection}
                  disabled={uploadingImage}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  size="large"
                  icon={uploadingImage ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  title={uploadingImage ? "Subiendo..." : "Subir foto"}
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  className="flex-1"
                />
              </div>
            )}

            {/* Delete Button - iOS Deluxe Style */}
            {!imagePreview && captain?.profileImage && (
              <Button
                variant="ghost"
                size="small"
                icon={uploadingImage ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
                title={uploadingImage ? "Eliminando..." : "Eliminar foto"}
                onClick={handleImageDelete}
                disabled={uploadingImage}
                className="mt-3 text-red-400 hover:text-red-300"
              />
            )}

            {/* Helper Text */}
            <p className="text-xs text-white/50 text-center mt-3 max-w-xs">
              JPEG, JPG, PNG o WEBP • Máx. 5MB
            </p>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit(updateUserProfile)} className="space-y-8">
            {/* Personal Information - iOS Deluxe */}
            <Card
              variant="glass"
              className="p-5 backdrop-blur-md"
            >
              <h2 className="text-lg font-bold text-white mb-6">
                Información personal
              </h2>

              {/* Email - Read Only - iOS Deluxe Style */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    defaultValue={captain.email}
                    disabled={true}
                    className="w-full h-14 pl-12 pr-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white/50 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone - iOS Deluxe Style */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="tel"
                    {...register("phone", { required: true })}
                    defaultValue={captain.phone}
                    className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors"
                    placeholder="+58 276 123 4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-400">El teléfono es requerido</p>
                )}
              </div>

              {/* Name Grid - iOS Deluxe */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Nombre
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      {...register("firstname", { required: true })}
                      defaultValue={captain.fullname.firstname}
                      className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors"
                      placeholder="Nombre"
                    />
                  </div>
                  {errors.firstname && (
                    <p className="mt-2 text-sm text-red-400">Requerido</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Apellido
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      {...register("lastname", { required: true })}
                      defaultValue={captain.fullname.lastname}
                      className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors"
                      placeholder="Apellido"
                    />
                  </div>
                  {errors.lastname && (
                    <p className="mt-2 text-sm text-red-400">Requerido</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Vehicle Information - iOS Deluxe */}
            <Card
              variant="glass"
              className="p-5 backdrop-blur-md"
            >
              <h2 className="text-lg font-bold text-white mb-6">
                Información del vehículo
              </h2>

              {/* Vehicle Type - iOS Deluxe Style */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Tipo de vehículo
                </label>
                <div className="relative">
                  {captain.vehicle.type === 'car' ? (
                    <CarIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  ) : (
                    <BikeIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  )}
                  <select
                    {...register("type", { required: true })}
                    defaultValue={captain.vehicle.type === 'car' ? 'carro' : 'moto'}
                    className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="carro">Carro</option>
                    <option value="moto">Moto</option>
                  </select>
                </div>
                {errors.type && (
                  <p className="mt-2 text-sm text-red-400">El tipo es requerido</p>
                )}
              </div>

              {/* Brand & Model Grid - iOS Deluxe */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Marca
                  </label>
                  <div className="relative">
                    <Package size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      {...register("brand", { required: true })}
                      defaultValue={captain.vehicle.brand || ''}
                      className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors"
                      placeholder="Toyota"
                    />
                  </div>
                  {errors.brand && (
                    <p className="mt-2 text-sm text-red-400">Requerido</p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Modelo
                  </label>
                  <div className="relative">
                    <Package size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      {...register("model", { required: true })}
                      defaultValue={captain.vehicle.model || ''}
                      className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors"
                      placeholder="Corolla"
                    />
                  </div>
                  {errors.model && (
                    <p className="mt-2 text-sm text-red-400">Requerido</p>
                  )}
                </div>
              </div>

              {/* Color & Capacity Grid - iOS Deluxe */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Color */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Color
                  </label>
                  <div className="relative">
                    <Palette size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      {...register("color", { required: true })}
                      defaultValue={captain.vehicle.color}
                      className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors"
                      placeholder="Negro"
                    />
                  </div>
                  {errors.color && (
                    <p className="mt-2 text-sm text-red-400">Requerido</p>
                  )}
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Capacidad
                  </label>
                  <div className="relative">
                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="number"
                      {...register("capacity", { required: true })}
                      defaultValue={captain.vehicle.capacity}
                      className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors"
                      placeholder="4"
                    />
                  </div>
                  {errors.capacity && (
                    <p className="mt-2 text-sm text-red-400">Requerido</p>
                  )}
                </div>
              </div>

              {/* Plate Number - iOS Deluxe Style */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Placa del vehículo
                </label>
                <div className="relative">
                  <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    {...register("number", { required: true })}
                    defaultValue={captain.vehicle.number}
                    className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors uppercase"
                    placeholder="ABC-123"
                  />
                </div>
                {errors.number && (
                  <p className="mt-2 text-sm text-red-400">La placa es requerida</p>
                )}
              </div>
            </Card>

            {/* Error Message - iOS Deluxe Style */}
            {responseError && (
              <Card
                variant="glass"
                className="p-4 border border-red-500/30 bg-red-500/10 backdrop-blur-md rounded-xl text-sm"
              >
                <div className="flex items-center gap-2">
                  <X size={16} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400">{responseError}</p>
                </div>
              </Card>
            )}

            {/* Submit Button - iOS Deluxe Style */}
            <Button
              variant="primary"
              size="large"
              type="submit"
              disabled={loading}
              className="w-full"
              icon={loading ? <Loader2 size={20} className="animate-spin" /> : null}
              title={loading ? "Actualizando..." : "Guardar cambios"}
            />
          </form>
        </motion.div>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-20" />
    </div>
  );
}

export default CaptainEditProfile;
