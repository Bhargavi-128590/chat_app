const User = require("../models/User");
const { sendOtp } = require("../utils/sendOtp");
const { generateToken } = require("../utils/jwt");
const { redisClient } = require("../config/redis");

const detectContactType = (input) => {
  if (!input || typeof input !== "string") {
    return { isValid: false };
  }

  const trimmed = input.trim();

  // Try email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) {
    return {
      isValid: true,
      type: "email",
      value: trimmed.toLowerCase(),
    };
  }

  // Clean phone number (remove spaces, hyphens, brackets)
  const cleanedPhone = trimmed.replace(/[\s\-\(\)]/g, "");
  // Phone regex (e.g. +1234567890 or 1234567890)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (phoneRegex.test(cleanedPhone)) {
    return {
      isValid: true,
      type: "phone",
      value: cleanedPhone,
    };
  }

  return { isValid: false };
};
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
    const inputContact = req.body.contact || req.body.email || req.body.phone;

    if (!inputContact || typeof inputContact !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required",
      });
    }

    const detection = detectContactType(inputContact);
    if (!detection.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or phone number format",
      });
    }

    const { type, value } = detection;
    let user;

    if (type === "email") {
      user = await User.findOne({ email: value });
      if (!user) {
        user = new User({ email: value });
        await user.save();
      }
    } else {
      user = await User.findOne({ phone: value });
      if (!user) {
        user = new User({ phone: value });
        await user.save();
      }
    }

    // Rate limit cooldown (30 seconds)
    const cooldown = await redisClient.get(`cooldown:${type}:${value}`);
    if (cooldown) {
      return res.status(429).json({
        success: false,
        message: "Please wait 30 seconds before requesting again",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis
    await redisClient.set(`otp:${type}:${value}`, otp, { EX: 300 });
    await redisClient.set(`cooldown:${type}:${value}`, "true", { EX: 30 });

    if (type === "email") {
      try {
        await sendOtp(value, otp);
      } catch (mailError) {
        console.error("Mail sending error:", mailError.message || mailError);
        return res.status(500).json({
          success: false,
          message: mailError.message || "Failed to send OTP. Please try again later.",
        });
      }
    } else {
      // Send via Twilio SMS
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;

      if (sid && token && from) {
        try {
          const twilio = require("twilio")(sid, token);
          await twilio.messages.create({
            body: `Your Chat App OTP code is ${otp}. It expires in 5 minutes.`,
            from: from,
            to: value,
          });
          console.log(`SMS OTP sent via Twilio to ${value}`);
        } catch (err) {
          console.error("Twilio SMS send failed:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to send SMS OTP via Twilio. Please try again later.",
          });
        }
      } else {
        // Mock fallback
        console.log("==========================================");
        console.log(`[MOCK SMS OTP] To: ${value} | OTP: ${otp}`);
        console.log("==========================================");
      }
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const inputContact = req.body.contact || req.body.email || req.body.phone;
    const { otp } = req.body;

    if (!inputContact || !otp) {
      return res.status(400).json({
        success: false,
        message: "Contact identifier and OTP are required",
      });
    }

    const detection = detectContactType(inputContact);
    if (!detection.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or phone number format",
      });
    }

    const { type, value } = detection;
    let user;

    if (type === "email") {
      user = await User.findOne({ email: value });
    } else {
      user = await User.findOne({ phone: value });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const storedOtp = await redisClient.get(`otp:${type}:${value}`);

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

    await redisClient.del(`otp:${type}:${value}`);

    user.isVerified = true;
    user.loggedOut = false;

    await user.save();

    await redisClient.set(`user:${value}`, JSON.stringify(user), { EX: 3600 });

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const inputContact = req.body.contact || req.body.email || req.body.phone;

    if (!inputContact || typeof inputContact !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required",
      });
    }

    const detection = detectContactType(inputContact);
    if (!detection.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or phone number format",
      });
    }

    const { type, value } = detection;
    let user;

    if (type === "email") {
      user = await User.findOne({ email: value });
    } else {
      user = await User.findOne({ phone: value });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cooldown = await redisClient.get(`cooldown:${type}:${value}`);

    if (cooldown) {
      return res.status(400).json({
        success: false,
        message: "Please wait 30 seconds before requesting again",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.set(`otp:${type}:${value}`, otp, { EX: 300 });
    await redisClient.set(`cooldown:${type}:${value}`, "true", { EX: 30 });

    if (type === "email") {
      await sendOtp(value, otp);
    } else {
      // Send via Twilio SMS
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;

      if (sid && token && from) {
        const twilio = require("twilio")(sid, token);
        await twilio.messages.create({
          body: `Your Chat App OTP code is ${otp}. It expires in 5 minutes.`,
          from: from,
          to: value,
        });
        console.log(`SMS OTP resent via Twilio to ${value}`);
      } else {
        // Mock fallback
        console.log("==========================================");
        console.log(`[MOCK SMS OTP RESEND] To: ${value} | OTP: ${otp}`);
        console.log("==========================================");
      }
    }

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.autoLogin = async (req, res) => {
  try {
    const inputContact = req.body.contact || req.body.email || req.body.phone;

    if (!inputContact || typeof inputContact !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required",
      });
    }

    const detection = detectContactType(inputContact);
    if (!detection.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or phone number format",
      });
    }

    const { type, value } = detection;

    const cachedUser = await redisClient.get(`user:${value}`);

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

    let user;
    if (type === "email") {
      user = await User.findOne({ email: value });
    } else {
      user = await User.findOne({ phone: value });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await redisClient.set(`user:${value}`, JSON.stringify(user), {
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

    return res.status(200).json({
      success: false,
      autoLogin: false,
      message: "OTP verification required",
    });
  } catch (error) {
    return res.status(500).json({
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
