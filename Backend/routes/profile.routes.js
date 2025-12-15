const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");

/**
 * Profile Completion Routes
 * Handles mandatory profile completion for OAuth users
 */

// Validation middleware for user profile completion
const userProfileValidation = [
  body("fullname.firstname")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2 })
    .withMessage("El nombre debe tener al menos 2 caracteres"),
  body("fullname.lastname")
    .trim()
    .notEmpty()
    .withMessage("El apellido es requerido")
    .isLength({ min: 2 })
    .withMessage("El apellido debe tener al menos 2 caracteres"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es requerido")
    .matches(/^[0-9]{10,15}$/)
    .withMessage("El teléfono debe tener entre 10 y 15 dígitos"),
];

// Validation middleware for captain profile completion
const captainProfileValidation = [
  body("fullname.firstname")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2 })
    .withMessage("El nombre debe tener al menos 2 caracteres"),
  body("fullname.lastname")
    .trim()
    .notEmpty()
    .withMessage("El apellido es requerido")
    .isLength({ min: 2 })
    .withMessage("El apellido debe tener al menos 2 caracteres"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es requerido")
    .matches(/^[0-9]{10,15}$/)
    .withMessage("El teléfono debe tener entre 10 y 15 dígitos"),
  body("vehicle.type")
    .trim()
    .notEmpty()
    .withMessage("El tipo de vehículo es requerido")
    .isIn(["car", "bike", "carro", "moto"])
    .withMessage("Tipo de vehículo inválido"),
  body("vehicle.color")
    .trim()
    .notEmpty()
    .withMessage("El color del vehículo es requerido")
    .isLength({ min: 3 })
    .withMessage("El color debe tener al menos 3 caracteres"),
  body("vehicle.number")
    .trim()
    .notEmpty()
    .withMessage("La placa del vehículo es requerida")
    .isLength({ min: 3 })
    .withMessage("La placa debe tener al menos 3 caracteres"),
  body("vehicle.capacity")
    .notEmpty()
    .withMessage("La capacidad del vehículo es requerida")
    .isInt({ min: 1, max: 10 })
    .withMessage("La capacidad debe ser entre 1 y 10"),
];

/**
 * POST /profile/complete
 * Complete profile for OAuth users
 * Requires authentication
 */
router.post(
  "/complete",
  authMiddleware.authUser,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const userType = req.user.userType || "user";
      
      // Determine which model and validation to use
      const Model = userType === "captain" ? captainModel : userModel;
      const validations = userType === "captain" ? captainProfileValidation : userProfileValidation;
      
      // Run validations
      await Promise.all(validations.map(validation => validation.run(req)));
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        });
      }

      const { fullname, phone, vehicle } = req.body;

      // Check if phone is already in use by another user
      const existingUserWithPhone = await userModel.findOne({ 
        phone, 
        _id: { $ne: userId } 
      });
      const existingCaptainWithPhone = await captainModel.findOne({ 
        phone, 
        _id: { $ne: userId } 
      });

      if (existingUserWithPhone || existingCaptainWithPhone) {
        return res.status(400).json({
          success: false,
          message: "Este número de teléfono ya está registrado",
        });
      }

      // Build update object
      const updateData = {
        "fullname.firstname": fullname.firstname,
        "fullname.lastname": fullname.lastname,
        phone,
        isProfileComplete: true,
      };

      // Add vehicle data for captains
      if (userType === "captain" && vehicle) {
        updateData["vehicle.type"] = vehicle.type;
        updateData["vehicle.color"] = vehicle.color;
        updateData["vehicle.number"] = vehicle.number;
        updateData["vehicle.capacity"] = parseInt(vehicle.capacity);
        if (vehicle.brand) updateData["vehicle.brand"] = vehicle.brand;
        if (vehicle.model) updateData["vehicle.model"] = vehicle.model;
      }

      // Update user/captain
      const updatedAccount = await Model.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updatedAccount) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Perfil completado exitosamente",
        [userType]: updatedAccount,
      });
    } catch (error) {
      console.error("Error completing profile:", error);
      res.status(500).json({
        success: false,
        message: "Error al completar el perfil",
        error: error.message,
      });
    }
  }
);

/**
 * GET /profile/status
 * Check if profile is complete
 * Requires authentication
 */
router.get(
  "/status",
  authMiddleware.authUser,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const userType = req.user.userType || "user";
      const Model = userType === "captain" ? captainModel : userModel;

      const account = await Model.findById(userId);

      if (!account) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      // Determine what fields are missing
      const missingFields = [];
      
      if (!account.phone) missingFields.push("phone");
      if (!account.fullname?.firstname) missingFields.push("fullname.firstname");
      if (!account.fullname?.lastname) missingFields.push("fullname.lastname");
      
      if (userType === "captain") {
        if (!account.vehicle?.type) missingFields.push("vehicle.type");
        if (!account.vehicle?.color) missingFields.push("vehicle.color");
        if (!account.vehicle?.number) missingFields.push("vehicle.number");
        if (!account.vehicle?.capacity) missingFields.push("vehicle.capacity");
      }

      res.status(200).json({
        success: true,
        isProfileComplete: account.isProfileComplete,
        missingFields,
        userType,
      });
    } catch (error) {
      console.error("Error checking profile status:", error);
      res.status(500).json({
        success: false,
        message: "Error al verificar estado del perfil",
      });
    }
  }
);

module.exports = router;
