
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const bcrypt = require("bcryptjs");
const {
  createNotification,
} = require("../utils/notificationService");

// =====================================================
// CREATE SUPERVISOR - ADMIN ONLY
// =====================================================

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
        message: "An account already exists with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
      message: "Supervisor created successfully.",
      supervisor: {
        id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        role: supervisor.role,
        assignedBlocks: supervisor.assignedBlocks,
      },
    });
  } catch (error) {
    console.error("CREATE SUPERVISOR ERROR:", error);

    return res.status(500).json({
      message: "Failed to create supervisor.",
      error: error.message,
    });
  }
};

// =====================================================
// GET SUPERVISORS - ADMIN ONLY
// =====================================================

const getSupervisors = async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    const supervisors = await User.find({
      role: "supervisor",
      assignedBlocks: {
        $in: admin.assignedBlocks || [],
      },
    }).select("name email assignedBlocks");

    res.json({
      supervisors,
    });
  } catch (error) {
    console.error("GET SUPERVISORS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch supervisors",
      error: error.message,
    });
  }
};

// =====================================================
// GET SUPERVISOR COMPLAINTS - SUPERVISOR ONLY
// =====================================================
// IMPORTANT:
// Student personal information is NOT populated here.
// Supervisor only receives maintenance-related information.
// =====================================================

const getSupervisorComplaints = async (req, res) => {
  try {
    const supervisor = await User.findById(req.user.userId).select(
      "role assignedBlocks"
    );

    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(403).json({
        message: "Access denied. Supervisor only.",
      });
    }

    const complaints = await Complaint.find({
      supervisor: supervisor._id,
      block: {
        $in: supervisor.assignedBlocks || [],
      },
    })
      .select(
  "block floor room category description image completionImage priority status technician createdAt assignedAt technicianAssignedAt resolvedAt feedbackRating feedbackComment"
)
      .populate(
        "technician",
        "name email specialization assignedBlocks"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      complaints,
    });
  } catch (error) {
    console.error("GET SUPERVISOR COMPLAINTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch supervisor complaints.",
      error: error.message,
    });
  }
};

// =====================================================
// GET TECHNICIANS - SUPERVISOR ONLY
// =====================================================
// Only technicians belonging to the Supervisor's block
// are returned.
// =====================================================

const getTechniciansForSupervisor = async (req, res) => {
  try {
    const supervisor = await User.findById(req.user.userId).select(
      "role assignedBlocks"
    );

    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(403).json({
        message: "Access denied. Supervisor only.",
      });
    }

    const technicians = await User.find({
      role: "technician",
      assignedBlocks: {
        $in: supervisor.assignedBlocks || [],
      },
    }).select(
      "name email specialization assignedBlocks"
    );

    return res.json({
      technicians,
    });
  } catch (error) {
    console.error("GET TECHNICIANS FOR SUPERVISOR ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch technicians.",
      error: error.message,
    });
  }
};

// =====================================================
// ASSIGN TECHNICIAN - SUPERVISOR ONLY
// =====================================================

const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({
        message: "Technician ID is required.",
      });
    }

    const supervisor = await User.findById(req.user.userId).select(
      "role assignedBlocks"
    );

    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(403).json({
        message: "Access denied. Supervisor only.",
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    // Supervisor can only manage complaints assigned to them.
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

    // Supervisor can only manage complaints from assigned blocks.
    if (
      !supervisor.assignedBlocks?.includes(
        complaint.block
      )
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to manage complaints from this block.",
      });
    }

    if (complaint.status === "Resolved") {
      return res.status(400).json({
        message:
          "Resolved complaint cannot be assigned again.",
      });
    }

    const technician = await User.findOne({
      _id: technicianId,
      role: "technician",
      assignedBlocks: complaint.block,
    }).select(
      "name email specialization assignedBlocks"
    );

    if (!technician) {
      return res.status(404).json({
        message:
          "Technician not found or technician is not assigned to this block.",
      });
    }

complaint.technician = technician._id;
complaint.status = "Assigned";
complaint.technicianAssignedAt = new Date();

await complaint.save();

await createNotification({
  recipient: technician._id,
  title: "New Complaint Assigned",
  message: `A ${complaint.category} complaint in ${complaint.block}, Room ${complaint.room} has been assigned to you.`,
  type: "technician_assigned",
  complaint: complaint._id,
});

    return res.json({
      message:
        "Complaint assigned to technician successfully.",
      complaint: {
        _id: complaint._id,
        block: complaint.block,
        room: complaint.room,
        category: complaint.category,
        description: complaint.description,
        image: complaint.image,
        priority: complaint.priority,
        status: complaint.status,
        supervisor: complaint.supervisor,
        technician: {
          _id: technician._id,
          name: technician.name,
          email: technician.email,
          specialization: technician.specialization,
          assignedBlocks: technician.assignedBlocks,
        },
createdAt: complaint.createdAt,
assignedAt: complaint.assignedAt,
technicianAssignedAt: complaint.technicianAssignedAt,
      },
    });
  } catch (error) {
    console.error("ASSIGN TECHNICIAN ERROR:", error);

    return res.status(500).json({
      message: "Failed to assign technician.",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createSupervisor,
  getSupervisors,
  getSupervisorComplaints,
  getTechniciansForSupervisor,
  assignTechnician,
};
