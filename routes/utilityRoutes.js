const express = require("express");
const utilityRoutes = express.Router();
const { getLocations } = require("../controllers/locationController");

utilityRoutes.get("/locations", getLocations);

module.exports = utilityRoutes;