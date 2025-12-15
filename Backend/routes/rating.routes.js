const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const ratingController = require("../controllers/rating.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Middleware to accept both user and captain authentication
const authUserOrCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: "No autorizado - Token requerido" });
  }

  // Create a wrapper to capture auth errors without breaking the flow
  const tryAuth = (authFunction) => {
    return new Promise((resolve, reject) => {
      authFunction(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  // Try user auth first
  try {
    await tryAuth(authMiddleware.authUser);
    return next();
  } catch (userError) {
    // User auth failed, try captain auth
    try {
      await tryAuth(authMiddleware.authCaptain);
      return next();
    } catch (captainError) {
      return res.status(401).json({ 
        message: "No autorizado - Token inválido",
        error: "Invalid token for both user and captain" 
      });
    }
  }
};

// Submit rating (user or captain)
router.post(
  "/submit",
  authUserOrCaptain,
  [
    body("rideId").isMongoId().withMessage("ID de viaje inválido"),
    body("stars")
      .isInt({ min: 1, max: 5 })
      .withMessage("Las estrellas deben ser entre 1 y 5"),
    body("comment")
      .optional()
      .isString()
      .isLength({ max: 250 })
      .withMessage("El comentario no puede tener más de 250 caracteres"),
    body("raterType")
      .isIn(["user", "captain"])
      .withMessage("Tipo de calificador inválido"),
  ],
  ratingController.submitRating
);

// Get rating status for a ride
router.get(
  "/:rideId/status",
  authUserOrCaptain,
  ratingController.getRatingStatus
);

module.exports = router;
