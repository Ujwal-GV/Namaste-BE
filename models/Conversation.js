import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  lastMessage: String,
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);