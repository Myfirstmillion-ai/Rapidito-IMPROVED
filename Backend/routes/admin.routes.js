const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authAdmin } = require("../middlewares/auth.middleware");

// Admin routes - all protected by authAdmin middleware
router.get("/captains", authAdmin, adminController.getAllCaptains);

router.patch("/captain/:id/status", authAdmin, adminController.toggleCaptainStatus);

module.exports = router;
