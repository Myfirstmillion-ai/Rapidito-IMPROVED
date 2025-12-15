const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const mapController = require('../controllers/map.controller');
const { query } = require('express-validator');

// HIGH-005: Added authentication to prevent API abuse
router.get('/get-coordinates',
    authMiddleware.authUser,
    query('address').isString().isLength({ min: 3 }),
    mapController.getCoordinates
);

router.get('/get-distance-time',
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getDistanceTime
);

router.get('/get-suggestions',
    query('input').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getAutoCompleteSuggestions
);

// Nueva ruta para obtener dirección desde coordenadas
router.get('/get-address',
    query('lat').isNumeric(),
    query('lng').isNumeric(),
    authMiddleware.authUser,
    mapController.getAddressFromCoordinates
);

module.exports = router;
