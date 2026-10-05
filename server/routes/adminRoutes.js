
const express = require("express");

const { createAdmin } = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Create Admin
router.post(
  "/create",
  protect,
  allowRoles("admin"),
  createAdmin
);

module.exports = router;
