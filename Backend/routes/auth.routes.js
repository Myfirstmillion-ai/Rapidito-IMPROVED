const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");

/**
 * Google OAuth Routes
 * Handles authentication flow for both users and captains
 */

// Initiate Google OAuth flow
// GET /auth/google?userType=user|captain
router.get(
  "/google",
  (req, res, next) => {
    const userType = req.query.userType || "user";
    
    // Validate userType
    if (!["user", "captain"].includes(userType)) {
      return res.status(400).json({ message: "Invalid userType. Must be 'user' or 'captain'" });
    }

    // Pass userType through state parameter
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: userType,
      prompt: "select_account", // Always show account selector
    })(req, res, next);
  }
);

// Google OAuth callback
// GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`
  }),
  async (req, res) => {
    try {
      const { account, userType } = req.user;

      if (!account) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_account`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: account._id, userType },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set httpOnly cookie for security
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.ENVIRONMENT === "production",
        sameSite: process.env.ENVIRONMENT === "production" ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Prepare user data for frontend
      const userData = {
        _id: account._id,
        fullname: account.fullname,
        email: account.email,
        phone: account.phone || "",
        profileImage: account.profileImage || "",
        emailVerified: account.emailVerified,
        authProvider: account.authProvider,
      };

      // Add captain-specific fields
      if (userType === "captain") {
        userData.vehicle = account.vehicle;
        userData.status = account.status;
      }

      // Encode user data for URL (base64)
      const encodedUserData = Buffer.from(JSON.stringify({
        type: userType,
        data: userData,
      })).toString("base64");

      // Determine redirect URL based on userType
      const redirectPath = userType === "captain" ? "/captain/home" : "/home";
      
      // Redirect to frontend with token and user data
      // Frontend will extract these from URL and store appropriately
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&userData=${encodedUserData}&redirect=${redirectPath}`
      );
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

// Check if email exists and get auth provider
// POST /auth/check-email
router.post("/check-email", async (req, res) => {
  try {
    const { email, userType = "user" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const Model = userType === "captain" 
      ? require("../models/captain.model") 
      : require("../models/user.model");

    const account = await Model.findOne({ email }).select("authProvider email");

    if (!account) {
      return res.json({ exists: false, authProvider: null });
    }

    return res.json({
      exists: true,
      authProvider: account.authProvider || "local",
    });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({ message: "Error checking email" });
  }
});

module.exports = router;
