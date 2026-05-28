const jwt = require("jsonwebtoken");

const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {

    let token;

    // Check authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Get user from DB
      req.user = await User.findById(
        decoded.id
      ).select("-otp");

      next();

    } else {

      return res.status(401).json({
        message: "No token provided",
      });

    }

  } catch (error) {

    return res.status(401).json({
      message: "Invalid token",
    });

  }
};