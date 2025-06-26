import express from "express";
import verifyToken from "../middlewares/verification.js";

const router = express.Router();

// Dummy "Am I Logged In?" protected route
router.get("/check-auth", verifyToken, (req, res) => {
  res.json({
    loggedIn: true,
    user: req.user,
  });
});

export default router;
