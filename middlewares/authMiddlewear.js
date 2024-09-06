const User = require("../models/user.model");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRATE_KEY);

        const user = await User.findOne({ email: decoded.email });
        req.user = user;

        next();
      }
    } catch (error) {
      return res.json({ type: "error", error: error });
    }
  } else {
    return res.json({ type: "error", error: "No token found" });
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email: email });
  if (adminUser.role !== "admin") {
    throw new Error("You are not an admin");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };
