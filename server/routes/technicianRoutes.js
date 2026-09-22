const express = require("express");

const {
  getTechnicians,
  createTechnician,
  deleteTechnician,
  createDefaultTechnicians,
} = require("../controllers/technicianController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all technicians
router.get(
  "/",
  protect,
  allowRoles("admin"),
  getTechnicians
);

// Add single technician
router.post(
  "/",
  protect,
  allowRoles("admin"),
  createTechnician
);

// Delete technician
router.delete(
  "/:id",
  protect,
  allowRoles("admin"),
  deleteTechnician
);

// Create default technicians
router.post(
  "/create-default",
  protect,
  allowRoles("admin"),
  createDefaultTechnicians
);

module.exports = router;