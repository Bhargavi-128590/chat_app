const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log("AUTH MIDDLEWARE");
  }

  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (process.env.NODE_ENV === "development") {
        console.log("Decoded token:", decoded);
      }

      const user = await User.findById(decoded.id).select("-otp");

      if (process.env.NODE_ENV === "development") {
        console.log("Authenticated user:", user?._id);
      }

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      req.user = user;

      return next();
    }

    return res.status(401).json({
      message: "No token provided",
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
