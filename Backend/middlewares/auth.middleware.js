const blacklistTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Blacklisted Unauthorized User" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // PERF-002: Removed .populate("rides") - only populate rides in endpoints that need them
    const user = await userModel.findOne({ _id: decoded.id });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    req.user = {
      _id: user._id,
      fullname: {
        firstname: user.fullname.firstname,
        lastname: user.fullname.lastname,
      },
      email: user.email,
      phone: user.phone,
      rides: user.rides,
      socketId: user.socketId,
      emailVerified: user.emailVerified || false,
      profileImage: user.profileImage || "",
      rating: user.rating || { average: 0, count: 0 },
    };
    req.userType = "user";

    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(401).json({ message: "Token Expired" });
    } else {
      return res.status(401).json({ message: "Unauthorized User", error });
    }
  }
};

module.exports.authCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // PERF-002: Removed .populate("rides") - only populate rides in endpoints that need them
    const captain = await captainModel.findOne({ _id: decoded.id });
    if (!captain) {
      return res.status(401).json({ message: "Unauthorized User" });
    }
    req.captain = {
      _id: captain._id,
      fullname: {
        firstname: captain.fullname.firstname,
        lastname: captain.fullname.lastname,
      },
      email: captain.email,
      phone: captain.phone,
      rides: captain.rides,
      socketId: captain.socketId,
      emailVerified: captain.emailVerified,
      vehicle: captain.vehicle,
      status: captain.status,
      profileImage: captain.profileImage || "",
      rating: captain.rating || { average: 0, count: 0 },
    };
    req.userType = "captain";
    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(401).json({ message: "Token Expired" });
    } else {
      return res.status(401).json({ message: "Unauthorized User", error });
    }
  }
};

// Admin authentication middleware - Super Admin check
module.exports.authAdmin = async (req, res, next) => {
  const token = req.cookies.token || req.headers.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: "Unauthorized Admin Access" });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized Admin Access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists (can be either user or captain)
    let adminUser = await userModel.findOne({ _id: decoded.id });
    if (!adminUser) {
      adminUser = await captainModel.findOne({ _id: decoded.id });
    }
    
    if (!adminUser) {
      return res.status(401).json({ message: "Unauthorized Admin Access" });
    }

    // Super Admin check - hardcoded email(s) for admin access
    const SUPER_ADMIN_EMAILS = [
      process.env.SUPER_ADMIN_EMAIL || "admin@rapidito.com",
      // Add more admin emails as needed
    ];

    if (!SUPER_ADMIN_EMAILS.includes(adminUser.email)) {
      return res.status(403).json({ message: "Access Denied: Admin privileges required" });
    }

    req.admin = {
      _id: adminUser._id,
      email: adminUser.email,
      fullname: adminUser.fullname,
    };
    
    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(401).json({ message: "Token Expired" });
    } else {
      return res.status(401).json({ message: "Unauthorized Admin Access", error });
    }
  }
};
