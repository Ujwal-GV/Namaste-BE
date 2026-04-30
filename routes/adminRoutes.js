const express = require("express");
const adminRoutes = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getOwnerRequests,
    approveOwner,
    rejectOwner,
    getStats,
    getUsersList,
    getUserById,
    getActivateBlockUser,
    getApplicationsForPropertyById,
    deleteUser
} = require("../controllers/adminController");
const adminOnly = require("../middleware/adminMiddleware");

adminRoutes.use(protect, authorizeRoles("admin"));
adminRoutes.delete("/delete-user/:id", protect, adminOnly, deleteUser);
adminRoutes.get("/owner-requests", protect, adminOnly, getOwnerRequests);
adminRoutes.put("/approve-owner/:id", protect, adminOnly, approveOwner);

adminRoutes.put("/reject-owner/:id", protect, adminOnly, rejectOwner);

adminRoutes.get("/stats", protect, adminOnly, getStats);

adminRoutes.get("/get-users", protect, adminOnly, getUsersList);
adminRoutes.get("/user/:id", protect, adminOnly, getUserById);
adminRoutes.put("/user/:id/status", protect, adminOnly, getActivateBlockUser);

adminRoutes.get("/property/:id/applications", protect, adminOnly, getApplicationsForPropertyById);

module.exports = adminRoutes;