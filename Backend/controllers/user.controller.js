const asyncHandler = require("express-async-handler");
const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");
const securityLogger = require("../services/security-logger"); // MEDIUM-015: Security logging

module.exports.registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, email, password, phone } = req.body;

  const alreadyExists = await userModel.findOne({ email });

  if (alreadyExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await userService.createUser(
    fullname.firstname,
    fullname.lastname,
    email,
    password,
    phone
  );

  const token = user.generateAuthToken();
  res
    .status(201)
    .json({ message: "User registered successfully", token, user });
});

module.exports.verifyEmail = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Invalid verification link", error: "Token is required" });
  }

  // H-007: Wrap JWT verification in try-catch for proper error handling
  let decodedTokenData;
  try {
    decodedTokenData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Verification link has expired. Please request a new one.", error: "Token expired" });
    }
    return res.status(400).json({ message: "Invalid verification link", error: "Invalid token" });
  }

  if (!decodedTokenData || decodedTokenData.purpose !== "email-verification") {
    return res.status(400).json({ message: "You're trying to use an invalid or expired verification link", error: "Invalid token" });
  }

  let user = await userModel.findOne({ _id: decodedTokenData.id });

  if (!user) {
    return res.status(404).json({ message: "User not found. Please ask for another verification link." });
  }

  if (user.emailVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  user.emailVerified = true;
  await user.save();

  res.status(200).json({
    message: "Email verified successfully",
  });
});

module.exports.loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(404).json({ message: "Correo o contraseña inválidos" });
  }

  // Check if user registered with Google OAuth
  if (user.authProvider === "google" && !user.password) {
    return res.status(400).json({ 
      message: "Esta cuenta fue creada con Google. Por favor, inicia sesión con Google.",
      authProvider: "google"
    });
  }

  // MEDIUM-014: Check if account is locked
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
  
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({ 
      message: `Cuenta bloqueada temporalmente. Intente de nuevo en ${remainingTime} minutos.` 
    });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    // Increment login attempts
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account if max attempts reached
    if (user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
      updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
      // MEDIUM-015: Log account lockout
      securityLogger.accountLocked(req, email, "user");
    }
    
    await userModel.findByIdAndUpdate(user._id, updates);
    // MEDIUM-015: Log failed login
    securityLogger.loginFailed(req, email, "user");
    return res.status(404).json({ message: "Correo o contraseña inválidos" });
  }
  
  // Reset login attempts on successful login
  if (user.loginAttempts > 0 || user.lockUntil) {
    await userModel.findByIdAndUpdate(user._id, { 
      loginAttempts: 0, 
      lockUntil: null 
    });
  }
  
  // MEDIUM-015: Log successful login
  securityLogger.loginSuccess(req, user._id, email, "user");

  const token = user.generateAuthToken();
  
  // CRITICAL-006: Set token as httpOnly cookie for XSS protection
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production",
    sameSite: process.env.ENVIRONMENT === "production" ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.json({
    message: "Inicio de sesión exitoso",
    token, // Still send token for localStorage fallback (mobile apps, etc.)
    user: {
      _id: user._id,
      fullname: {
        firstname: user.fullname.firstname,
        lastname: user.fullname.lastname,
      },
      email: user.email,
      phone: user.phone,
      rides: user.rides,
      socketId: user.socketId,
      emailVerified: user.emailVerified,
    },
  });
});

module.exports.userProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports.updateUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname,  phone } = req.body;

  const updatedUserData = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    {
      fullname: fullname,
      phone,
    },
    { new: true }
  );

  res
    .status(200)
    .json({ message: "Perfil actualizado exitosamente", user: updatedUserData });
});

module.exports.logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  // HIGH-008: Get token from all possible sources including Authorization header
  const token = req.cookies.token || req.headers.token || req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    await blacklistTokenModel.create({ token });
  }

  res.status(200).json({ message: "Sesión cerrada exitosamente" });
});

module.exports.resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { token, password } = req.body;
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({
        message:
          "This password reset link has expired or is no longer valid. Please request a new one to continue",
      });
    } else {
      return res.status(400).json({
        message:
          "The password reset link is invalid or has already been used. Please request a new one to proceed",
        error: err,
      });
    }
  }

  const user = await userModel.findById(payload.id);
  if (!user)
    return res.status(404).json({
      message: "User not found. Please check your credentials and try again",
    });

  user.password = await userModel.hashPassword(password);
  await user.save();

  // M-010: Invalidate reset token after successful use by blacklisting it
  await blacklistTokenModel.create({ token });

  res.status(200).json({
    message:
      "Your password has been successfully reset. You can now log in with your new credentials",
  });
});

// Controladores para ubicaciones guardadas (favoritos)

/**
 * Obtener todas las ubicaciones guardadas del usuario
 */
module.exports.getSavedLocations = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  
  // Ordenar por tipo: primero home, luego work, luego favorites
  const orderedLocations = [];
  
  // Primero casa
  const home = user.savedLocations.find(loc => loc.type === 'home');
  if (home) orderedLocations.push(home);
  
  // Luego trabajo
  const work = user.savedLocations.find(loc => loc.type === 'work');
  if (work) orderedLocations.push(work);
  
  // Finalmente favoritos, ordenados por fecha de creación (más recientes primero)
  const favorites = user.savedLocations
    .filter(loc => loc.type === 'favorite')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  orderedLocations.push(...favorites);
  
  res.status(200).json({ locations: orderedLocations });
});

/**
 * Añadir una nueva ubicación guardada
 */
module.exports.addSavedLocation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { type, label, address, coordinates } = req.body;
  const user = await userModel.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  
  // Validar límites según tipo
  if (type === 'home') {
    const existingHome = user.savedLocations.find(loc => loc.type === 'home');
    if (existingHome) {
      return res.status(400).json({ 
        message: "Ya tienes una ubicación guardada como 'Casa'. Edita la existente o elimínala antes de agregar una nueva."
      });
    }
  }
  
  if (type === 'work') {
    const existingWork = user.savedLocations.find(loc => loc.type === 'work');
    if (existingWork) {
      return res.status(400).json({ 
        message: "Ya tienes una ubicación guardada como 'Trabajo'. Edita la existente o elimínala antes de agregar una nueva."
      });
    }
  }
  
  if (type === 'favorite') {
    const favoriteCount = user.savedLocations.filter(loc => loc.type === 'favorite').length;
    if (favoriteCount >= 5) {
      return res.status(400).json({ 
        message: "Has alcanzado el límite máximo de 5 ubicaciones favoritas. Elimina alguna antes de agregar una nueva."
      });
    }
  }
  
  // Crear nueva ubicación
  const newLocation = {
    type,
    address,
    coordinates,
    createdAt: new Date()
  };
  
  // Agregar label si es de tipo favorite
  if (type === 'favorite') {
    newLocation.label = label;
  }
  
  // Guardar la nueva ubicación
  user.savedLocations.push(newLocation);
  await user.save();
  
  res.status(201).json({ 
    message: "Ubicación guardada exitosamente", 
    location: newLocation 
  });
});

/**
 * Actualizar una ubicación guardada existente
 */
module.exports.updateSavedLocation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { id } = req.params;
  const { label, address } = req.body;
  
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  
  // Encontrar la ubicación por ID
  const locationIndex = user.savedLocations.findIndex(loc => loc._id.toString() === id);
  
  if (locationIndex === -1) {
    return res.status(404).json({ message: "Ubicación no encontrada" });
  }
  
  // Solo permitir actualizar label y address
  if (label) user.savedLocations[locationIndex].label = label;
  if (address) user.savedLocations[locationIndex].address = address;
  
  await user.save();
  
  res.status(200).json({ 
    message: "Ubicación actualizada exitosamente", 
    location: user.savedLocations[locationIndex] 
  });
});

/**
 * Eliminar una ubicación guardada
 */
module.exports.deleteSavedLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  
  // Verificar que no sea la única ubicación
  if (user.savedLocations.length <= 1) {
    return res.status(400).json({ 
      message: "No puedes eliminar tu única ubicación guardada" 
    });
  }
  
  // Encontrar y eliminar la ubicación
  const locationIndex = user.savedLocations.findIndex(loc => loc._id.toString() === id);
  
  if (locationIndex === -1) {
    return res.status(404).json({ message: "Ubicación no encontrada" });
  }
  
  // Eliminar ubicación
  const deletedLocation = user.savedLocations.splice(locationIndex, 1)[0];
  await user.save();
  
  res.status(200).json({ 
    message: "Ubicación eliminada exitosamente", 
    deletedLocation 
  });
});
