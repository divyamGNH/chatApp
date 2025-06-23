import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../dbModels/user";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ username, password: hashed });
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET);
  res.cookie('token', token, { httpOnly: true }).json({ username });
});

module.exports = router;