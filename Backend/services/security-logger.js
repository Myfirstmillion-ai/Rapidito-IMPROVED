const mongoose = require("mongoose");

// MEDIUM-015: Security event logging schema
const securityLogSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: [
      "LOGIN_FAILED",
      "LOGIN_SUCCESS",
      "ACCOUNT_LOCKED",
      "UNAUTHORIZED_ACCESS",
      "PASSWORD_CHANGED",
      "PASSWORD_RESET_REQUESTED",
      "PASSWORD_RESET_COMPLETED",
      "OTP_FAILED",
      "OTP_EXPIRED",
      "SOCKET_AUTH_FAILED",
      "RATE_LIMIT_EXCEEDED",
      "SUSPICIOUS_ACTIVITY"
    ]
  },
  userType: {
    type: String,
    enum: ["user", "captain", "admin", "unknown"],
    default: "unknown"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient querying
securityLogSchema.index({ event: 1, timestamp: -1 });
securityLogSchema.index({ userId: 1, timestamp: -1 });
securityLogSchema.index({ ip: 1, timestamp: -1 });
securityLogSchema.index({ timestamp: -1 });

const SecurityLog = mongoose.model("SecurityLog", securityLogSchema);

/**
 * Security Logger Service
 * Logs security-related events to MongoDB for audit and monitoring
 */
const securityLogger = {
  /**
   * Log a security event
   * @param {string} event - Event type
   * @param {object} data - Event data
   */
  async log(event, data = {}) {
    try {
      const logEntry = new SecurityLog({
        event,
        userType: data.userType || "unknown",
        userId: data.userId || null,
        email: data.email || null,
        ip: data.ip || null,
        userAgent: data.userAgent || null,
        details: data.details || {}
      });
      
      await logEntry.save();
      
      // Console log for development
      if (process.env.ENVIRONMENT !== "production") {
        console.log(`🔒 SECURITY: ${event}`, {
          email: data.email,
          ip: data.ip,
          userType: data.userType
        });
      }
    } catch (error) {
      console.error("Security logging failed:", error.message);
    }
  },

  /**
   * Log failed login attempt
   */
  async loginFailed(req, email, userType = "unknown") {
    await this.log("LOGIN_FAILED", {
      email,
      userType,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
      details: { path: req.path }
    });
  },

  /**
   * Log successful login
   */
  async loginSuccess(req, userId, email, userType) {
    await this.log("LOGIN_SUCCESS", {
      userId,
      email,
      userType,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"]
    });
  },

  /**
   * Log account lockout
   */
  async accountLocked(req, email, userType) {
    await this.log("ACCOUNT_LOCKED", {
      email,
      userType,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
      details: { reason: "Too many failed login attempts" }
    });
  },

  /**
   * Log unauthorized access attempt
   */
  async unauthorizedAccess(req, userId, resource) {
    await this.log("UNAUTHORIZED_ACCESS", {
      userId,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
      details: { resource, method: req.method, path: req.path }
    });
  },

  /**
   * Log password change
   */
  async passwordChanged(req, userId, userType) {
    await this.log("PASSWORD_CHANGED", {
      userId,
      userType,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"]
    });
  },

  /**
   * Log OTP verification failure
   */
  async otpFailed(rideId, captainId, attempts) {
    await this.log("OTP_FAILED", {
      userType: "captain",
      userId: captainId,
      details: { rideId, attempts }
    });
  },

  /**
   * Log socket authentication failure
   */
  async socketAuthFailed(socketId, reason) {
    await this.log("SOCKET_AUTH_FAILED", {
      details: { socketId, reason }
    });
  },

  /**
   * Get recent security events
   * @param {object} filter - Query filter
   * @param {number} limit - Max results
   */
  async getRecentEvents(filter = {}, limit = 100) {
    return SecurityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  },

  /**
   * Get failed login attempts for an email in the last hour
   */
  async getRecentFailedLogins(email, hours = 1) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return SecurityLog.countDocuments({
      event: "LOGIN_FAILED",
      email,
      timestamp: { $gte: since }
    });
  }
};

module.exports = securityLogger;
