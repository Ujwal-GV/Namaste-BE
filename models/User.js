const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    profilePic: String,

    mobile: String,

    googleId: {
        type: String,
        unique: true,
        sparse: true
    },

    password: { type: String },

    role: {
        type: String,
        enum: ["user", "owner", "admin"],
        default: "user",
    },

    verificationStatus: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none"
    },

    rejectionDetails: {
        reason: String,
        rejectedAt: Date,
        count:{
            type: Number,
            default: 0,
        },
    },

    documents: {
        idProof: String,
        propertyProof: String,
    },

    preferredLocation: String,

    lifestyle: {
        smoking: Boolean,
        drinking: Boolean,
        sleepTime: String,
        cleanliness: String,
    },

    budget: Number,

    accountStatus: {
        type: String,
        enum: ["active", "blocked"],
        default: "active",
    } 

},{timestamps: true});

module.exports = mongoose.model("User", userSchema);