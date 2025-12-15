const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Definir esquema para ubicaciones guardadas
const savedLocationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'favorite'],
    required: true
  },
  label: {
    type: String,
    required: function() {
      return this.type === 'favorite';
    },
    maxlength: 30
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const userSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true,
        minlength: 3,
      },
      lastname: {
        type: String,
        minlength: 3,
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
      maxlength: 10,
    },
    socketId: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: "",
    },
    rides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
      },
    ],
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
        // OAuth users need to complete phone number
        return this.authProvider === 'local';
      },
    },
    // Ubicaciones guardadas del usuario (favoritos, casa, trabajo)
    savedLocations: {
      type: [savedLocationSchema],
      default: [],
      validate: [
        {
          validator: function(locations) {
            // Validar máximo 1 ubicación de tipo 'home'
            const homeLocations = locations.filter(loc => loc.type === 'home');
            return homeLocations.length <= 1;
          },
          message: 'Solo puede tener una ubicación de tipo "home"'
        },
        {
          validator: function(locations) {
            // Validar máximo 1 ubicación de tipo 'work'
            const workLocations = locations.filter(loc => loc.type === 'work');
            return workLocations.length <= 1;
          },
          message: 'Solo puede tener una ubicación de tipo "work"'
        },
        {
          validator: function(locations) {
            // Validar máximo 5 ubicaciones de tipo 'favorite'
            const favoriteLocations = locations.filter(loc => loc.type === 'favorite');
            return favoriteLocations.length <= 5;
          },
          message: 'No puede tener más de 5 ubicaciones de tipo "favorite"'
        }
      ]
    },
  },
  { timestamps: true }
);

// Indexes for performance optimization
// Index for socket-based user lookups
userSchema.index({ socketId: 1 });

// Email is already unique, but explicit index helps
userSchema.index({ email: 1 });

// Index for Google OAuth lookups
userSchema.index({ googleId: 1 }, { sparse: true });

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, userType: "user" }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
