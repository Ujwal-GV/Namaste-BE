const express = require("express");
const conversationRoutes = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { createConversation, getMessages, sendMessage, getConversations } = require("../controllers/ConversationController");



conversationRoutes.post("/", protect, createConversation);
conversationRoutes.get("/", protect, getConversations);
conversationRoutes.get("/messages/:id", protect, getMessages);

conversationRoutes.post("/message",  protect, sendMessage);


module.exports = conversationRoutes;