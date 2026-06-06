const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {

    let token;

    // Check if token exists in header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      req.user = await User.findById(decoded.id).select("-password");

      next(); // move to next controller

    } else {
      return res.status(401).json({
        message: "Not authorized, token missing"
      });
    }

  } catch (error) {
    res.status(401).json({
      message: "Token failed",
      error: error.message
    });
  }
};

const adminOnly = (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next(); // allow access
    } else {
      return res.status(403).json({
        message: "Access denied, admin only"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error in admin middleware",
      error: error.message
    });
  }
};

module.exports = { protect, adminOnly };