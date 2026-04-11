const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    location: {
        type: String,
        required: true,
    },

    detailedAddress: {
        type: String,
        required: true,
    },

    rent: {
        type: Number,
        required: true,
    },

    deposit: {
        type: Number,
        required: true,
    },

    description: String,

    images: [
        { 
            type: String,
        }
    ],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {timestamps: true});

module.exports = mongoose.model("Property", propertySchema);