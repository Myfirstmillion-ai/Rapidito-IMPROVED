const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { body } = require("express-validator");
const { authUser } = require("../middlewares/auth.middleware");

router.post("/register",
    body("email").isEmail().withMessage("Invalid Email"),
    // H-003: Enhanced password strength validation
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character"),
    body("fullname.firstname").isLength({min:2}).withMessage("First name must be at least 2 characters long"),
    body("phone").isLength({min:10, max:10}).withMessage("Phone number should be of 10 digits only"),
    userController.registerUser
);

router.post("/verify-email", userController.verifyEmail);

router.post("/login", 
    body("email").isEmail().withMessage("Invalid Email"),
    userController.loginUser
);

router.post("/update", authUser,
    body("fullname.firstname").isLength({min:2}).withMessage("First name must be at least 2 characters long"),
    body("fullname.lastname").isLength({min:2}).withMessage("Last name must be at least 2 characters long"),
    body("phone").isLength({min:10, max:10}).withMessage("Phone number should be of 10 digits only"),
    userController.updateUserProfile
);

router.get("/profile", authUser, userController.userProfile);

router.get("/logout", authUser, userController.logoutUser);

router.post(
    "/reset-password",
    body("token").notEmpty().withMessage("Token is required"),
    // H-003: Enhanced password strength validation
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character"),
    userController.resetPassword
);

// Endpoints para ubicaciones guardadas (favoritos)

// Obtener todas las ubicaciones guardadas
router.get("/saved-locations", 
    authUser, 
    userController.getSavedLocations
);

// Agregar nueva ubicación guardada
router.post("/saved-locations", 
    authUser,
    body("type").isIn(['home', 'work', 'favorite']).withMessage("El tipo debe ser 'home', 'work' o 'favorite'"),
    body("address").notEmpty().withMessage("La dirección es obligatoria"),
    body("coordinates.lat").isNumeric().withMessage("La latitud debe ser un número"),
    body("coordinates.lng").isNumeric().withMessage("La longitud debe ser un número"),
    body("label").custom((value, { req }) => {
        if (req.body.type === 'favorite' && (!value || value.trim() === '')) {
            throw new Error('El nombre es obligatorio para ubicaciones favoritas');
        }
        return true;
    }),
    userController.addSavedLocation
);

// Actualizar ubicación guardada
router.put("/saved-locations/:id", 
    authUser,
    body("label").optional(),
    body("address").optional(),
    userController.updateSavedLocation
);

// Eliminar ubicación guardada
router.delete("/saved-locations/:id", 
    authUser,
    userController.deleteSavedLocation
);

module.exports = router;
