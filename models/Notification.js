const { default: mongoose } = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  type: {
    type: String,
    enum: [
      "APPLICATION",
      "MESSAGE",
      "STATUS",
      "ADMIN",
    ],
  },

  title: String,
  message: String,

  isRead: { type: Boolean, default: false },

  link: String,

}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);