const mongoose = require("mongoose");
const Property = require("./Property");
const User = require("./User");

const contactRequestSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
    },

    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    message: String,

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
}, { timestamps: true });

module.exports = mongoose.model("ContactRequest", contactRequestSchema);