import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const createConversation = async (req, res) => {
  const { propertyId, userId, ownerId } = req.body;
  console.log(req.body);
  

  let convo = await Conversation.findOne({
    propertyId,
    participants: { $all: [userId, ownerId] },
  });

  if (!convo) {
    convo = await Conversation.create({
      propertyId,
      participants: [userId, ownerId],
    });
  }  
  res.json(convo);
};

export const getConversations = async (req, res) => {
  const userId = req.user.id;

  const convos = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "name email")
    .sort({ updatedAt: -1 });

  res.json(convos);
};

export const getMessages = async (req, res) => {
  const messages = await Message.find({
    conversationId: req.params.id,
  }).sort({ createdAt: 1 });

  res.json(messages);
};

export const sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;

  const msg = await Message.create({
    conversationId,
    senderId: req.user.id,
    text,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: text,
    updatedAt: new Date(),
  });

  res.json(msg);
};