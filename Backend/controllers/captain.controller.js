const asyncHandler = require("express-async-handler");
const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");
const securityLogger = require("../services/security-logger"); // MEDIUM-015: Security logging

module.exports.registerCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, email, password, phone, vehicle } = req.body;

  const alreadyExists = await captainModel.findOne({ email });

  if (alreadyExists) {
    return res.status(400).json({ message: "Captain already exists" });
  }

  const captain = await captainService.createCaptain(
    fullname.firstname,
    fullname.lastname,
    email,
    password,
    phone,
    vehicle.color,
    vehicle.number,
    vehicle.capacity,
    vehicle.type,
    vehicle.brand || "",
    vehicle.model || ""
  );

  const token = captain.generateAuthToken();
  res
    .status(201)
    .json({ message: "Captain registered successfully", token, captain });
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

  let captain = await captainModel.findOne({ _id: decodedTokenData.id });

  if (!captain) {
    return res.status(404).json({ message: "User not found. Please ask for another verification link." });
  }

  if (captain.emailVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  captain.emailVerified = true;
  await captain.save();

  res.status(200).json({
    message: "Email verified successfully",
  });
});

module.exports.loginCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");
  if (!captain) {
    return res.status(404).json({ message: "Correo o contraseña inválidos" });
  }

  // Check if captain registered with Google OAuth
  if (captain.authProvider === "google" && !captain.password) {
    return res.status(400).json({ 
      message: "Esta cuenta fue creada con Google. Por favor, inicia sesión con Google.",
      authProvider: "google"
    });
  }

  // MEDIUM-014: Check if account is locked
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
  
  if (captain.lockUntil && captain.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((captain.lockUntil - Date.now()) / 60000);
    return res.status(423).json({ 
      message: `Cuenta bloqueada temporalmente. Intente de nuevo en ${remainingTime} minutos.` 
    });
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    // Increment login attempts
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account if max attempts reached
    if (captain.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
      updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
      // MEDIUM-015: Log account lockout
      securityLogger.accountLocked(req, email, "captain");
    }
    
    await captainModel.findByIdAndUpdate(captain._id, updates);
    // MEDIUM-015: Log failed login
    securityLogger.loginFailed(req, email, "captain");
    return res.status(404).json({ message: "Correo o contraseña inválidos" });
  }
  
  // Reset login attempts on successful login
  if (captain.loginAttempts > 0 || captain.lockUntil) {
    await captainModel.findByIdAndUpdate(captain._id, { 
      loginAttempts: 0, 
      lockUntil: null 
    });
  }
  
  // MEDIUM-015: Log successful login
  securityLogger.loginSuccess(req, captain._id, email, "captain");

  // Membership Gatekeeper - Check if membership is active
  if (!captain.isMembershipActive) {
    return res.status(403).json({ 
      error: "MEMBERSHIP_REQUIRED", 
      message: "Account inactive." 
    });
  }

  const token = captain.generateAuthToken();
  
  // CRITICAL-006: Set token as httpOnly cookie for XSS protection
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production",
    sameSite: process.env.ENVIRONMENT === "production" ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  res.json({ message: "Inicio de sesión exitoso", token, captain });
});

module.exports.captainProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ captain: req.captain });
});

module.exports.updateCaptainProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { captainData } = req.body;
  
  // HIGH-006: Whitelist of allowed fields to prevent unauthorized modifications
  const allowedFields = ['fullname', 'phone', 'vehicle'];
  const sanitizedData = {};
  
  for (const field of allowedFields) {
    if (captainData[field] !== undefined) {
      sanitizedData[field] = captainData[field];
    }
  }
  
  // Further restrict vehicle fields that can be modified
  if (sanitizedData.vehicle) {
    const allowedVehicleFields = ['color', 'brand', 'model'];
    const sanitizedVehicle = {};
    for (const field of allowedVehicleFields) {
      if (sanitizedData.vehicle[field] !== undefined) {
        sanitizedVehicle[field] = sanitizedData.vehicle[field];
      }
    }
    sanitizedData.vehicle = sanitizedVehicle;
  }
  
  const updatedCaptainData = await captainModel.findOneAndUpdate(
    { _id: req.captain._id },
    { $set: sanitizedData },
    { new: true }
  );

  res.status(200).json({
    message: "Perfil actualizado exitosamente",
    captain: updatedCaptainData,
  });
});

module.exports.logoutCaptain = asyncHandler(async (req, res) => {
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
      return res.status(400).json({ message: "This password reset link has expired or is no longer valid. Please request a new one to continue" });
    } else {
      return res.status(400).json({ message: "The password reset link is invalid or has already been used. Please request a new one to proceed", error: err });
    }
  }

  const captain = await captainModel.findById(payload.id);
  if (!captain) return res.status(404).json({ message: "User not found. Please check your credentials and try again" });

  captain.password = await captainModel.hashPassword(password);
  await captain.save();

  // M-010: Invalidate reset token after successful use by blacklisting it
  await blacklistTokenModel.create({ token });

  res.status(200).json({ message: "Your password has been successfully reset. You can now log in with your new credentials" });
});
