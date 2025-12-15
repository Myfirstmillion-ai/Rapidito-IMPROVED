const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authUser, authCaptain } = require('../middlewares/auth.middleware');
const { upload } = require('../services/upload.service');

// Subir foto de perfil de usuario
router.post('/user/profile-image',
  authUser,
  upload.single('profileImage'),
  uploadController.uploadUserProfileImage
);

// Subir foto de perfil de conductor
router.post('/captain/profile-image',
  authCaptain,
  upload.single('profileImage'),
  uploadController.uploadCaptainProfileImage
);

// Eliminar foto de perfil (accepts both user and captain)
router.delete('/profile-image',
  (req, res, next) => {
    // Try user auth first, fallback to captain
    authUser(req, res, (err) => {
      if (err || !req.user) {
        authCaptain(req, res, next);
      } else {
        next();
      }
    });
  },
  uploadController.deleteProfileImage
);

module.exports = router;
