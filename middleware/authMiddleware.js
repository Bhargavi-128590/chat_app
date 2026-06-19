const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  console.log("AUTH MIDDLEWARE");

  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

console.log("Decoded");
console.log(decoded);


      const user = await User.findById(decoded.id).select("-otp");

console.log("User");
console.log(user);

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