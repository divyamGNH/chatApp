import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../dbModels/user.js";
import dotenv from "dotenv";


dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashed });
    
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
  { username },
  JWT_SECRET,
  { expiresIn: '1d' }
);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production (HTTPS)
      maxAge: 24 * 60 * 60 * 1000 // 1 day in ms
    });

    // Send response
    res.status(200).json({ message: 'Login successful', username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not logged in' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ username: decoded.username });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;