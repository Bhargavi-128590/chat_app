const User = require("../models/User");
const { sendOtp } = require("../utils/sendOtp");
const { generateToken } = require("../utils/jwt");
const {redisClient} = require("../config/redis").redisClient;

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

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
      await user.save();
    }

    console.log("Before Redis SET");

    const result = await redisClient.set(`otp:${email}`, otp, { EX: 300 });

    console.log("Redis SET Result:", result);

    const storedOtp = await redisClient.get(`otp:${email}`);

    console.log("Stored OTP:", storedOtp);

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

    const storedOtp = await redisClient.get(`otp:${email}`);

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

    await redisClient.del(`otp:${email}`);

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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cooldown = await redisClient.get(`cooldown:${email}`);

    if (cooldown) {
      return res.status(400).json({
        success: false,
        message: "Please wait 30 seconds before requesting again",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.set(`otp:${email}`, otp, { EX: 300 });

    await redisClient.set(`cooldown:${email}`, "true", { EX: 30 });

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

exports.autoLogin = async (req, res) => {
  try {
    const { email } = req.body;

    const cachedUser = await redisClient.get(`user:${email}`);

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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await redisClient.set(`user:${email}`, JSON.stringify(user), { EX: 3600 });

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
