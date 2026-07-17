const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  console.log("GET NOTIFICATIONS CALLED");
  try {
    console.log("req.user");
    console.log(req.user);

    const notifications = await Notification.find({
      receiver: req.user._id,
    })
      .populate("sender", "name profilePic")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        receiver: req.user._id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
