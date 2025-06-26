import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  try {
    // Try to get token from Authorization header
    let token = req.headers.authorization?.split(' ')[1];

    // Or from cookies (if you are storing JWT in cookies)
    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request for later use
    req.user = decoded;

    next(); // Allow request to proceed
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default verifyToken;
