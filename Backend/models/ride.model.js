const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Captain",
    },
    pickup: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    // PERF-001: Store coordinates to eliminate N+1 queries
    pickupCoordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    destinationCoordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    fare: {
      type: Number,
      required: true,
    },
    vehicle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    duration: {
      type: Number,
    }, // in seconds

    distance: {
      type: Number,
    }, // in meters

    paymentMethod: {
      type: String,
      enum: ['cash', 'nequi'],
      default: 'cash',
      required: true
    },
    paymentID: {
      type: String,
    },
    orderId: {
      type: String,
    },
    signature: {
      type: String,
    },
    otp: {
      type: String,
      select: false,
      required: true,
    },
    // MEDIUM-012: OTP expiration timestamp
    otpExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from creation
    },
    // MEDIUM-013: OTP attempts tracking for brute force prevention
    otpAttempts: {
      type: Number,
      default: 0,
    },
    messages: [
      {
        msg: String,
        by: {
          type: String,
          enum: ["user", "captain"],
        },
        time: String,
        date: String,
        timestamp: Date,
        _id: false
      },
    ],
    // Track which captains have been offered this ride (prevent duplicates)
    offeredTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Captain",
    }],
    // Rating system
    rating: {
      // Rating given by user to captain
      userToCaptain: {
        stars: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: 250,
        },
        createdAt: Date,
      },
      // Rating given by captain to user
      captainToUser: {
        stars: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: 250,
        },
        createdAt: Date,
      },
    },
  },
  { timestamps: true }
);

// Indexes for performance optimization
// Compound index for user ride queries
rideSchema.index({ user: 1, status: 1 });

// Compound index for captain ride queries
rideSchema.index({ captain: 1, status: 1 });

// Index for status-based queries (finding pending rides, etc.)
rideSchema.index({ status: 1, createdAt: -1 });

// Index for efficient ride lookups
rideSchema.index({ _id: 1, status: 1 });

// Index for pending rides lookup (late joiner system)
rideSchema.index({ status: 1, createdAt: -1, vehicle: 1 });

module.exports = mongoose.model("Ride", rideSchema);
