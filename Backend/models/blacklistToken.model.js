const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours in seconds
    }
});

// MEDIUM-004: Explicit index for faster token lookups
blacklistTokenSchema.index({ token: 1 });

module.exports = mongoose.model('BlacklistToken', blacklistTokenSchema);