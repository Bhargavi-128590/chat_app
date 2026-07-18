const User = require("../models/User");
const { sendOtp } = require("../utils/sendOtp");
const { generateToken } = require("../utils/jwt");
const { redisClient } = require("../config/redis");
// // Send OTP
// exports.sendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     let user = await User.findOne({ email });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     if (!user) {
//       user = new User({ email });
//     }

//     user.otp = otp;
//     user.otpExpiry = Date.now() + 5 * 60 * 1000;

//     await user.save();

//     await sendOtp(email, otp);

//     res.status(200).json({
//       success: true,
//       message: "OTP sent successfully",
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   }
// };

// // Verify OTP
// exports.verifyOtp = async (req, res) => {
//   try {

//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (!user.otp || user.otp !== otp.toString()) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     if (user.otpExpiry < Date.now()) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP expired",
//       });
//     }

//     user.isVerified = true;

//     user.loggedOut = false;

//     user.otp = null;
//     user.otpExpiry = null;

//     await user.save();

//     const token = generateToken(user);

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user,
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   }
// };

// // Resend OTP with cooldown
// exports.resendOtp = async (req, res) => {
//   try {

//     const { email } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // 30 sec cooldown
//     if (
//       user.otpSentAt &&
//       Date.now() - user.otpSentAt.getTime() < 30000
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Please wait 30 seconds before requesting again",
//       });
//     }

//     const otp = Math.floor(
//       100000 + Math.random() * 900000
//     ).toString();

//     user.otp = otp;

//     user.otpExpiry = Date.now() + 5 * 60 * 1000;

//     user.otpSentAt = Date.now();

//     await user.save();

//     await sendOtp(email, otp);

//     res.status(200).json({
//       success: true,
//       message: "OTP resent successfully",
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   }
// };

// // Auto login (existing user)
// exports.autoLogin = async (req, res) => {
//   try {

//     const { email } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // If user already logged in
//     if (!user.loggedOut) {

//       const token = generateToken(user);

//       return res.status(200).json({
//         success: true,
//         autoLogin: true,
//         token,
//         user,
//       });
//     }

//     res.status(200).json({
//       success: false,
//       autoLogin: false,
//       message: "OTP verification required",
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   }
// };

// // Logout
// exports.logout = async (req, res) => {
//   try {

//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     user.loggedOut = true;

//     user.isOnline = false;

//     user.socketId = "";

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Logged out successfully",
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   }
// };

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.endsWith("@gmail.com")) {
      return res.status(403).json({
        success: false,
        message: "Only @gmail.com emails are allowed",
      });
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = new User({ email: normalizedEmail });
      await user.save();
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.set(`otp:${normalizedEmail}`, otp, { EX: 300 });

    try {
      await sendOtp(normalizedEmail, otp);
    } catch (mailError) {
      console.error("Mail sending error:", mailError.message || mailError);
      return res.status(500).json({
        success: false,
        message:
          mailError.message || "Failed to send OTP. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const storedOtp = await redisClient.get(`otp:${normalizedEmail}`);

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (storedOtp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await redisClient.del(`otp:${normalizedEmail}`);

    user.isVerified = true;
    user.loggedOut = false;

    await user.save();

    await redisClient.set(`user:${email}`, JSON.stringify(user), { EX: 3600 });

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

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cooldown = await redisClient.get(`cooldown:${normalizedEmail}`);

    if (cooldown) {
      return res.status(400).json({
        success: false,
        message: "Please wait 30 seconds before requesting again",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.set(`otp:${normalizedEmail}`, otp, { EX: 300 });

    await redisClient.set(`cooldown:${normalizedEmail}`, "true", { EX: 30 });

    await sendOtp(normalizedEmail, otp);

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

exports.autoLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.endsWith("@gmail.com")) {
      return res.status(403).json({
        success: false,
        message: "Only @gmail.com emails are allowed",
      });
    }

    const cachedUser = await redisClient.get(`user:${normalizedEmail}`);

    if (cachedUser) {
      console.log("CACHE HIT");

      const user = JSON.parse(cachedUser);

      if (!user.loggedOut) {
        const token = generateToken(user);

        return res.status(200).json({
          success: true,
          autoLogin: true,
          token,
          user,
        });
      }
    }

    console.log("CACHE MISS");

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await redisClient.set(`user:${normalizedEmail}`, JSON.stringify(user), {
      EX: 3600,
    });

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

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);

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

    await redisClient.del(`user:${user.email}`);

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

exports.saveFcmToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      fcmToken: token,
    });

    res.json({
      success: true,
      message: "FCM token saved",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
