import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { ArrowLeft, Camera, Upload, X, Loader2, User, Mail, Phone } from "lucide-react";
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

function UserEditProfile() {
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

  const { user, setUser } = useUser();
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
        `${import.meta.env.VITE_SERVER_URL}/upload/user/profile-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUser({
        ...user,
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
          data: { userType: 'user' },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setUser({
        ...user,
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
    const userData = {
      fullname: {
        firstname: data.firstname,
        lastname: data.lastname,
      },
      phone: data.phone,
    };
    Console.log(userData);
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/update`,
        userData,
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log(response);
      showAlert('¡Actualización exitosa!', 'Tu perfil ha sido actualizado correctamente', 'success');

      setTimeout(() => {
        navigation("/home");
      }, 3000)
    } catch (error) {
      showAlert('Ocurrió un error', error.response?.data?.[0]?.msg || 'Error al actualizar', 'failure');
      Console.log(error.response);
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
                {imagePreview || user?.profileImage ? (
                  <img 
                    src={imagePreview || user?.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[${colors.accent}] to-[${colors.accent}]/70">
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
            {user?.rating && (
              <div className="mb-4">
                <StarRating 
                  average={user.rating.average} 
                  count={user.rating.count}
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
            {!imagePreview && user?.profileImage && (
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
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 max-w-xs">
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
            {/* Email - Read Only - iOS Deluxe Style */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled={true}
                  className="w-full h-14 pl-12 pr-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white/50 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* First Name - iOS Deluxe Style */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Nombre
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  {...register("firstname", { required: true })}
                  defaultValue={user.fullname.firstname}
                  className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors"
                  placeholder="Tu nombre"
                />
              </div>
              {errors.firstname && (
                <p className="mt-2 text-sm text-red-400">El nombre es requerido</p>
              )}
            </div>

            {/* Last Name - iOS Deluxe Style */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Apellido
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  {...register("lastname", { required: true })}
                  defaultValue={user.fullname.lastname}
                  className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors"
                  placeholder="Tu apellido"
                />
              </div>
              {errors.lastname && (
                <p className="mt-2 text-sm text-red-400">El apellido es requerido</p>
              )}
            </div>

            {/* Phone - iOS Deluxe Style */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="tel"
                  {...register("phone", { required: true })}
                  defaultValue={user.phone}
                  className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/30 rounded-xl text-white outline-none transition-colors"
                  placeholder="+58 276 123 4567"
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-400">El teléfono es requerido</p>
              )}
            </div>

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

export default UserEditProfile;