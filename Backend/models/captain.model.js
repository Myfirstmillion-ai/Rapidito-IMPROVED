const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const captainSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true,
        minlength: 3,
      },
      lastname: {
        type: String,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
      type: String,
      required: function() {
        // Password required only for local auth
        return this.authProvider === 'local';
      },
      minlength: 8,
      select: false,
    },
    // OAuth fields
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    phone: {
      type: String,
      minlength: 10,
      maxlength: 15,
    },
    socketId: {
      type: String,
    },
    rides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    vehicle: {
      color: {
        type: String,
        required: function() {
          // Vehicle details required only for local auth (OAuth users complete profile later)
          return this.authProvider === 'local';
        },
        minlength: [3, "El color debe tener al menos 3 caracteres"],
      },
      number: {
        type: String,
        required: function() {
          return this.authProvider === 'local';
        },
        minlength: [3, "La placa debe tener al menos 3 caracteres"],
      },
      capacity: {
        type: Number,
        required: function() {
          return this.authProvider === 'local';
        },
      },
      type: {
        type: String,
        required: function() {
          return this.authProvider === 'local';
        },
        enum: ["car", "bike", "carro", "moto"],
      },
      brand: {
        type: String,
        default: "",
      },
      model: {
        type: String,
        default: "",
      },
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: "",
    },
    // Rating statistics
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    // Membership fields
    isMembershipActive: {
      type: Boolean,
      default: false,
    },
    membershipPlan: {
      type: String,
      enum: ['Weekly', 'Bi-Weekly', 'Monthly', '2-Months', '3-Months', null],
      default: null,
    },
    membershipExpiresAt: {
      type: Date,
      default: null,
    },
    // MEDIUM-014: Account lockout for brute force prevention
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    // Profile completion flag for OAuth users
    isProfileComplete: {
      type: Boolean,
      default: function() {
        // Local auth users have complete profile by default (required fields at registration)
        // OAuth users need to complete phone and vehicle details
        return this.authProvider === 'local';
      },
    },
  },
  { timestamps: true }
);

// Middleware para normalizar el tipo de vehículo
captainSchema.pre('save', function(next) {
  if (this.vehicle && this.vehicle.type) {
    const typeMap = {
      'carro': 'car',
      'moto': 'bike',
      'car': 'car',
      'bike': 'bike'
    };
    this.vehicle.type = typeMap[this.vehicle.type.toLowerCase()] || this.vehicle.type;
  }
  next();
});

captainSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

captainSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, userType: "captain" },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
};

captainSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Indexes for performance optimization
// Geospatial index for location-based queries (CRITICAL for getCaptainsInTheRadius)
captainSchema.index({ location: '2dsphere' });

// Compound index for vehicle type and location queries
captainSchema.index({ 'vehicle.type': 1, location: '2dsphere' });

// Index for socket-based lookups
captainSchema.index({ socketId: 1 });

// Index for status queries
captainSchema.index({ status: 1 });

// Index for Google OAuth lookups
captainSchema.index({ googleId: 1 }, { sparse: true });

module.exports = mongoose.model("Captain", captainSchema);
