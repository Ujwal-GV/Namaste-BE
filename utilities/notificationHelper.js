const Notification = require("../models/Notification");

exports.createNotification = async ({
  userId,
  type,
  title,
  message,
  link,
}) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
    });
  } catch (err) {
    console.log("Notification error:", err.message);
  }
};