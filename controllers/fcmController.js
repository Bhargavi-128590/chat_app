const User = require("../models/User");

exports.saveFcmToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Token required",
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,

      {
        fcmToken: token,
      },
    );

    res.status(200).json({
      success: true,

      message: "FCM token saved",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};
