const express = require("express");
const requestRoutes = express.Router();
const { applyToProperty, getOwnerRequests, getPropertyRequestsById, getMyRequestForProperty }  = require("../controllers/requestController");
const protect = require("../middleware/authMiddleware");


requestRoutes.post("/apply", protect, applyToProperty);
requestRoutes.get("/owner", protect, getOwnerRequests);
requestRoutes.get("/:id", protect, getPropertyRequestsById);
requestRoutes.get("/my/:propertyId", protect, getMyRequestForProperty);

module.exports = requestRoutes;