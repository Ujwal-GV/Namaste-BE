const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {    
    const notifications = await Notification
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(20);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getnotificationReadStatus = async (req, res) => {
  try {
    const data = await Notification.findByIdAndUpdate(req.params.id, {
        isRead: true,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotificationById = async (req, res) => {
  try {
    const data = await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    const data = await Notification.deleteMany({ user: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};