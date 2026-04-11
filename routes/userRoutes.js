const express = require("express");
const userRoutes = express.Router();

const { register, login, getProfile, applyForOwner, requestContact, getOwnerRequests, updateRequestStatus, updateProfile } = require("../controllers/userController");
const authorizeRoles = require("../middleware/roleMiddleware");
const protect = require("../middleware/authMiddleware");
const upload = require("../controllers/upload");
console.log("Entered routes");

userRoutes.post("/register", register);
userRoutes.post("/login", login);

userRoutes.get("/profile", protect, getProfile);
userRoutes.post("/apply-owner", protect, applyForOwner);
userRoutes.post("/request-contact", protect, requestContact);
userRoutes.get("/owner", protect, getOwnerRequests);
// userRoutes.put("/:requestId", protect, updateRequestStatus);
userRoutes.put("/update-profile", protect, upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "propertyProof", maxCount: 1 },
]),
updateProfile);

module.exports = userRoutes;