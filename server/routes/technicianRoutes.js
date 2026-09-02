const express = require("express");

const { getTechnicians } = require("../controllers/technicianController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  allowRoles("admin"),
  getTechnicians
);

module.exports = router;