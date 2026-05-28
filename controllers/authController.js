const User = require("../models/User");
const { sendOtp } = require("../utils/sendOtp");
const { generateToken } = require("../utils/jwt");

// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    

    let user = await User.findOne({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (!user) {
      user = new User({ email });
    }

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendOtp(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || user.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isVerified = true;

    user.loggedOut = false;

    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// Resend OTP with cooldown
exports.resendOtp = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 30 sec cooldown
    if (
      user.otpSentAt &&
      Date.now() - user.otpSentAt.getTime() < 30000
    ) {
      return res.status(400).json({
        success: false,
        message: "Please wait 30 seconds before requesting again",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.otp = otp;

    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    user.otpSentAt = Date.now();

    await user.save();

    await sendOtp(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// Auto login (existing user)
exports.autoLogin = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If user already logged in
    if (!user.loggedOut) {

      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        autoLogin: true,
        token,
        user,
      });
    }

    res.status(200).json({
      success: false,
      autoLogin: false,
      message: "OTP verification required",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Logout
exports.logout = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.loggedOut = true;

    user.isOnline = false;

    user.socketId = "";

    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};