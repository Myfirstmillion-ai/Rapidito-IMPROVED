const asyncHandler = require("express-async-handler");
const { uploadToCloudinary, deleteFromCloudinary } = require("../services/upload.service");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");

// Subir foto de perfil de usuario
module.exports.uploadUserProfileImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se proporcionó ninguna imagen" });
    }

    const userId = req.user._id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar imagen anterior si existe
    if (user.profileImage) {
      await deleteFromCloudinary(user.profileImage);
    }

    // Subir nueva imagen
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'rapidito/users');
    
    user.profileImage = imageUrl;
    await user.save();

    res.status(200).json({
      message: "Foto de perfil actualizada exitosamente",
      profileImage: imageUrl
    });

  } catch (error) {
    console.error("Error subiendo imagen:", error);
    res.status(500).json({ message: "Error al subir la imagen" });
  }
});

// Subir foto de perfil de conductor
module.exports.uploadCaptainProfileImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se proporcionó ninguna imagen" });
    }

    const captainId = req.captain._id;
    const captain = await captainModel.findById(captainId);

    if (!captain) {
      return res.status(404).json({ message: "Conductor no encontrado" });
    }

    // Eliminar imagen anterior si existe
    if (captain.profileImage) {
      await deleteFromCloudinary(captain.profileImage);
    }

    // Subir nueva imagen
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'rapidito/captains');
    
    captain.profileImage = imageUrl;
    await captain.save();

    res.status(200).json({
      message: "Foto de perfil actualizada exitosamente",
      profileImage: imageUrl
    });

  } catch (error) {
    console.error("Error subiendo imagen:", error);
    res.status(500).json({ message: "Error al subir la imagen" });
  }
});

// Eliminar foto de perfil
module.exports.deleteProfileImage = asyncHandler(async (req, res) => {
  try {
    const { userType } = req.body;
    
    if (userType === 'user' && req.user) {
      const user = await userModel.findById(req.user._id);
      if (user && user.profileImage) {
        await deleteFromCloudinary(user.profileImage);
        user.profileImage = "";
        await user.save();
      }
    } else if (userType === 'captain' && req.captain) {
      const captain = await captainModel.findById(req.captain._id);
      if (captain && captain.profileImage) {
        await deleteFromCloudinary(captain.profileImage);
        captain.profileImage = "";
        await captain.save();
      }
    }

    res.status(200).json({ message: "Foto de perfil eliminada exitosamente" });

  } catch (error) {
    console.error("Error eliminando imagen:", error);
    res.status(500).json({ message: "Error al eliminar la imagen" });
  }
});
