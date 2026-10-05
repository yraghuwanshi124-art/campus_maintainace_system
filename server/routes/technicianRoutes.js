
const express = require("express");

const {
  getTechnicians,
  createTechnician,
  deleteTechnician,
} = require("../controllers/technicianController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// SUPERVISOR - GET TECHNICIANS
// =====================================================

router.get(
  "/",
  protect,
  allowRoles("supervisor"),
  getTechnicians
);

// =====================================================
// SUPERVISOR - ADD TECHNICIAN
// =====================================================

router.post(
  "/",
  protect,
  allowRoles("supervisor"),
  createTechnician
);

// =====================================================
// SUPERVISOR - DELETE TECHNICIAN
// =====================================================

router.delete(
  "/:id",
  protect,
  allowRoles("supervisor"),
  deleteTechnician
);

module.exports = router;
