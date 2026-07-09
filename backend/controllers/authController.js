const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER USER
// REGISTER USER
// http://localhost:5000/api/auth/register
// JSON BODY :
// {
//   "name": "Diya",
//   "email": "diya@test.com",
//   "password": "123456"
// }
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Server-side Validation
    if (!name || !email || !password) {
       return res.status(400).json({ message: "All input fields are required" });
    }
    if (password.length < 6) {
       return res.status(400).json({ message: "Password must consist of 6 or more characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN USER
// http://localhost:5000/api/auth/login
// JSON BODY :
// {
//   "email": "diya@test.com",
//   "password": "123456"
// }
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Server-side Validation
    if (!email || !password) {
       return res.status(400).json({ message: "Email and password fields are mandatory" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Checking if it's a Google-only account trying to login traditionally
    if (!user.password) {
      return res.status(400).json({ message: "Account created using Google. Please Sign In with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GOOGLE OAUTH CONTROLLER
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google ID token missing" });
    }

    // Verify token with Google's API
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();

    const { sub, email, name, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Google email structure is unverified" });
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({
    email: normalizedEmail
    });

    // Upstream onboarding fallback logic if user is signing up for the first time
    if (!user) {
      // Create account without password parameter since authentication is delegated to Google
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId: sub,
        role: "user", // Default placeholder context
      });
    } else if (!user.googleId) {
      // If user exists but was not created via Google, link the Google ID to their account
      user.googleId = sub;
      await user.save();
    }

    const appToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Google Authentication successful",
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
}
};

module.exports = { registerUser, loginUser, googleAuth };