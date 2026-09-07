
const express = require("express");

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getAssignedComplaints,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  uploadCompletionPhoto,
} = require("../controllers/complaintController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, createComplaint);

router.get("/my", protect, getMyComplaints);

router.get(
  "/all",
  protect,
  allowRoles("admin"),
  getAllComplaints
);

router.get(
  "/assigned",
  protect,
  allowRoles("technician"),
  getAssignedComplaints
);

router.patch(
  "/:id/status",
  protect,
  allowRoles("technician"),
  updateComplaintStatus
);



router.patch(
  "/:id/completion-photo",
  protect,
  allowRoles("technician"),
  uploadCompletionPhoto
);

router.patch(
  "/:id/assign",
  protect,
  allowRoles("admin"),
  assignComplaint
);

// Delete resolved complaint
router.delete(
  "/:id",
  protect,
  allowRoles("student", "admin", "technician"),
  deleteComplaint
);

module.exports = router;
