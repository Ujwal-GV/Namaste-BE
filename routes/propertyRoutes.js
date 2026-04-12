const express = require("express");
const propertyRoutes = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    addProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getMyProperties,
    updateRequestStatus,
} = require("../controllers/propertyController");
const upload = require("../controllers/upload");

propertyRoutes.get("/", getProperties);
propertyRoutes.get("/:id", getPropertyById);

propertyRoutes.post("/",  protect, authorizeRoles("owner", "admin"), upload.array("images", 5), addProperty);
propertyRoutes.put("/:id", protect, authorizeRoles("owner", "admin"), upload.array("images", 5), updateProperty);
propertyRoutes.delete("/:id", protect, authorizeRoles("admin", "owner"), deleteProperty);

propertyRoutes.get("/my-properties/:id", protect, getMyProperties);
propertyRoutes.put("/update-status/:requestId", protect, updateRequestStatus);


module.exports = propertyRoutes;