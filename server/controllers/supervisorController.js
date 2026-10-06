
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const bcrypt = require("bcryptjs");

const {
  createNotification,
} = require("../utils/notificationService");

// ======================================================
// CATEGORY → TECHNICIAN SPECIALIZATION
// ======================================================

const specializationMap = {
  Computer: "Computer Technician",
  Fan: "Electrician",
  Light: "Electrician",
  AC: "AC Technician",
  Door: "Carpenter",
};

// ======================================================
// CREATE SUPERVISOR - ADMIN ONLY
// ======================================================

const createSupervisor = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      password,
      assignedBlocks,
    } = req.body;

    if (
      !name ||
      !email ||
      !phoneNumber ||
      !password ||
      !Array.isArray(assignedBlocks) ||
      assignedBlocks.length === 0
    ) {
      return res.status(400).json({
        message:
          "Name, email, phone number, password and assigned blocks are required.",
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "An account already exists with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const supervisor = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      password: hashedPassword,
      role: "supervisor",
      assignedBlocks,
      classSection: "SUPERVISOR",
      isVerified: true,
      registrationEmailVerified: true,
    });

    return res.status(201).json({
      message:
        "Supervisor created successfully.",

      supervisor: {
        id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        role: supervisor.role,
        assignedBlocks:
          supervisor.assignedBlocks,
      },
    });
  } catch (error) {
    console.error(
      "CREATE SUPERVISOR ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create supervisor.",
      error: error.message,
    });
  }
};

// ======================================================
// GET SUPERVISORS - ADMIN ONLY
// ======================================================

const getSupervisors = async (req, res) => {
  try {
    const admin = await User.findById(
      req.user.userId
    );

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        message:
          "Access denied. Admin only.",
      });
    }

    // Supervisor is common for the whole college.
    // Therefore, do not filter by Admin block.

    const supervisors = await User.find({
      role: "supervisor",
    }).select(
      "name email assignedBlocks"
    );

    return res.json({
      supervisors,
    });
  } catch (error) {
    console.error(
      "GET SUPERVISORS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch supervisors.",
      error: error.message,
    });
  }
};

// ======================================================
// GET SUPERVISOR COMPLAINTS
// ======================================================
// Supervisor can see complaints assigned to THIS supervisor.
//
// IMPORTANT:
// Student personal information is intentionally NOT selected.
// No name, email, phone, enrollment, department,
// semester or classSection is exposed.
// ======================================================

const getSupervisorComplaints = async (
  req,
  res
) => {
  try {
    const supervisor = await User.findById(
      req.user.userId
    ).select("role");

    if (
      !supervisor ||
      supervisor.role !== "supervisor"
    ) {
      return res.status(403).json({
        message:
          "Access denied. Supervisor only.",
      });
    }

    const complaints = await Complaint.find({
      supervisor: supervisor._id,
    })
      .select(
        [
          "block",
          "floor",
          "room",
          "category",
          "description",
          "image",
          "completionImage",
          "priority",
          "status",
          "technician",
          "createdAt",
          "assignedAt",
          "technicianAssignedAt",
          "resolvedAt",
          "feedbackRating",
          "feedbackComment",
        ].join(" ")
      )
      .populate(
        "technician",
        "name email specialization"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      complaints,
    });
  } catch (error) {
    console.error(
      "GET SUPERVISOR COMPLAINTS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch supervisor complaints.",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL COLLEGE TECHNICIANS - SUPERVISOR ONLY
// ======================================================
//
// Technicians are common for the whole college.
// There is NO block filtering.
//
// Only technician information required for assignment
// is returned.
// ======================================================

const getTechniciansForSupervisor = async (
  req,
  res
) => {
  try {
    const supervisor = await User.findById(
      req.user.userId
    ).select("role");

    if (
      !supervisor ||
      supervisor.role !== "supervisor"
    ) {
      return res.status(403).json({
        message:
          "Access denied. Supervisor only.",
      });
    }

    const technicians = await User.find({
      role: "technician",
    }).select(
      "name email specialization"
    );

    return res.json({
      technicians,
    });
  } catch (error) {
    console.error(
      "GET TECHNICIANS FOR SUPERVISOR ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch technicians.",
      error: error.message,
    });
  }
};

// ======================================================
// ASSIGN TECHNICIAN - SUPERVISOR ONLY
// ======================================================
//
// Technician is selected according to complaint category.
//
// Computer → Computer Technician
// Fan      → Electrician
// Light    → Electrician
// AC       → AC Technician
// Door     → Carpenter
//
// Technician block is NOT checked.
// ======================================================

const assignTechnician = async (
  req,
  res
) => {
  try {
    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({
        message:
          "Technician ID is required.",
      });
    }

    // ----------------------------------------------
    // VERIFY SUPERVISOR
    // ----------------------------------------------

    const supervisor = await User.findById(
      req.user.userId
    ).select("role");

    if (
      !supervisor ||
      supervisor.role !== "supervisor"
    ) {
      return res.status(403).json({
        message:
          "Access denied. Supervisor only.",
      });
    }

    // ----------------------------------------------
    // FIND COMPLAINT
    // ----------------------------------------------

    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        message:
          "Complaint not found.",
      });
    }

    // ----------------------------------------------
    // CHECK SUPERVISOR OWNERSHIP
    // ----------------------------------------------

    if (
      !complaint.supervisor ||
      complaint.supervisor.toString() !==
        supervisor._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to manage this complaint.",
      });
    }

    // ----------------------------------------------
    // RESOLVED COMPLAINT CHECK
    // ----------------------------------------------

    if (
      complaint.status === "Resolved"
    ) {
      return res.status(400).json({
        message:
          "Resolved complaint cannot be assigned again.",
      });
    }

    // ----------------------------------------------
    // FIND REQUIRED SPECIALIZATION
    // ----------------------------------------------

    const requiredSpecialization =
      specializationMap[
        complaint.category
      ];

    // ----------------------------------------------
    // BUILD TECHNICIAN QUERY
    // ----------------------------------------------

    const technicianQuery = {
      _id: technicianId,
      role: "technician",
    };

    // If the complaint has a known category,
    // technician must have the correct specialization.

    if (requiredSpecialization) {
      technicianQuery.specialization =
        requiredSpecialization;
    }

    // ----------------------------------------------
    // FIND TECHNICIAN
    // ----------------------------------------------

    const technician =
      await User.findOne(
        technicianQuery
      ).select(
        "name email specialization"
      );

    if (!technician) {
      if (requiredSpecialization) {
        return res.status(400).json({
          message:
            `Please select a technician qualified for ${complaint.category} complaints.`,
        });
      }

      return res.status(404).json({
        message:
          "Technician not found.",
      });
    }

    // ----------------------------------------------
    // ASSIGN TECHNICIAN
    // ----------------------------------------------

    complaint.technician =
      technician._id;

    complaint.status = "Assigned";

    complaint.technicianAssignedAt =
      new Date();

    await complaint.save();

    // ----------------------------------------------
    // NOTIFY TECHNICIAN
    // ----------------------------------------------

    await createNotification({
      recipient: technician._id,

      title:
        "New Complaint Assigned",

      message:
        `A ${complaint.category} complaint in ${complaint.block}, Room ${complaint.room} has been assigned to you.`,

      type: "technician_assigned",

      complaint: complaint._id,
    });

    // ----------------------------------------------
    // RESPONSE
    // ----------------------------------------------

    return res.json({
      message:
        "Complaint assigned to technician successfully.",

      complaint: {
        _id: complaint._id,

        block: complaint.block,

        floor: complaint.floor,

        room: complaint.room,

        category:
          complaint.category,

        description:
          complaint.description,

        image:
          complaint.image,

        completionImage:
          complaint.completionImage,

        priority:
          complaint.priority,

        status:
          complaint.status,

        supervisor:
          complaint.supervisor,

        technician: {
          _id: technician._id,

          name:
            technician.name,

          email:
            technician.email,

          specialization:
            technician.specialization,
        },

        createdAt:
          complaint.createdAt,

        assignedAt:
          complaint.assignedAt,

        technicianAssignedAt:
          complaint.technicianAssignedAt,

        resolvedAt:
          complaint.resolvedAt,
      },
    });
  } catch (error) {
    console.error(
      "ASSIGN TECHNICIAN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to assign technician.",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createSupervisor,
  getSupervisors,
  getSupervisorComplaints,
  getTechniciansForSupervisor,
  assignTechnician,
};
