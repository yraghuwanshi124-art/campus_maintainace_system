
const express = require("express");

const {
  createSupervisor,
  getSupervisors,
  getSupervisorComplaints,
  getTechniciansForSupervisor,
  assignTechnician,
} = require("../controllers/supervisorController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// ADMIN
// =====================================================

// Create supervisor
router.post(
  "/create",
  protect,
  allowRoles("admin"),
  createSupervisor
);

// Get supervisors
router.get(
  "/",
  protect,
  allowRoles("admin"),
  getSupervisors
);

// =====================================================
// SUPERVISOR
// =====================================================

// Get complaints assigned to logged-in supervisor
router.get(
  "/complaints",
  protect,
  allowRoles("supervisor"),
  getSupervisorComplaints
);

// Get technicians available to logged-in supervisor
router.get(
  "/technicians",
  protect,
  allowRoles("supervisor"),
  getTechniciansForSupervisor
);

// Assign technician to complaint
router.patch(
  "/complaints/:id/assign-technician",
  protect,
  allowRoles("supervisor"),
  assignTechnician
);

module.exports = router;
