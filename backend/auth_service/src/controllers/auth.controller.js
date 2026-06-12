const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _config = require("../config/config");

const register = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      role,
    });

    const tokenPayload = {
      id: newUser._id,
      role: newUser.role,
      email: newUser.email,
      username: newUser.username,
    };
    const token = jwt.sign(tokenPayload, _config.JWT_SECRET, {
      expiresIn: "30d",
    });

    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.username,
      },
      _config.JWT_SECRET,
      {
        expiresIn: "30d",
      },
    );

    res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const logout = (req, res) => {
  res.status(200).json({ message: "User logged out successfully" });
};

const getMe = async (req, res) => {
  const user = req.user;
  res.status(200).json({ user });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};