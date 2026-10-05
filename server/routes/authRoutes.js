
const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  registerUser,
  verifyOTP,
  completeRegistration,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// ================= PROTECTED PROFILE =================

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected profile route",
    user: req.user,
  });
});

// ================= REGISTRATION =================

router.post("/register", registerUser);

router.post("/verify-otp", verifyOTP);

router.post("/complete-registration", completeRegistration);

// ================= LOGIN =================

router.post("/login", loginUser);

// ================= FORGOT PASSWORD =================

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

// ================= CHANGE PASSWORD =================

router.patch("/change-password", protect, changePassword);

module.exports = router;
