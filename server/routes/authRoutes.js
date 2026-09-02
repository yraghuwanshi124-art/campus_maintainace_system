const protect = require("../middleware/authMiddleware");
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected profile route",
    user: req.user,
  });
});

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;