const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getNotifications, getnotificationReadStatus, deleteNotificationById, deleteAllNotifications } = require("../controllers/notificationController");
const notificationRoutes = express.Router();

notificationRoutes.get("/notifications", protect, getNotifications);

// Mark read
notificationRoutes.put("/notifications/:id/read", protect, getnotificationReadStatus);
notificationRoutes.delete("/notifications/:id", protect, deleteNotificationById);
notificationRoutes.delete("/notifications", protect, deleteAllNotifications);

module.exports = notificationRoutes;