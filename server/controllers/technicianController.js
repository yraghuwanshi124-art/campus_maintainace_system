
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// =====================================================
// GET TECHNICIANS
// SUPERVISOR CAN ONLY SEE TECHNICIANS OF HIS BLOCKS
// =====================================================

const getTechnicians = async (req, res) => {
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
    console.error("Get technicians error:", error);

    return res.status(500).json({
      message: "Failed to fetch technicians",
      error: error.message,
    });
  }
};

// =====================================================
// ADD NEW TECHNICIAN
// SUPERVISOR CAN ADD TECHNICIAN ONLY TO HIS BLOCK
// =====================================================

const createTechnician = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      block,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !specialization ||
      !block
    ) {
      return res.status(400).json({
        message:
          "Name, email, password, specialization and block are required.",
      });
    }

    const supervisor = await User.findById(
      req.user.userId
    ).select("role assignedBlocks");

    if (
      !supervisor ||
      supervisor.role !== "supervisor"
    ) {
      return res.status(403).json({
        message: "Access denied. Supervisor only.",
      });
    }

    const normalizedBlock = block.trim();

    // Supervisor can only create technician
    // for his own assigned block.
    if (
      !supervisor.assignedBlocks?.includes(
        normalizedBlock
      )
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to add technicians to this block.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail =
      email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const technician = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "technician",
      specialization,
      assignedBlocks: [normalizedBlock],
      classSection: "Staff",
      isVerified: true,
      registrationEmailVerified: true,
    });

    return res.status(201).json({
      message:
        "Technician created successfully",
      technician: {
        _id: technician._id,
        name: technician.name,
        email: technician.email,
        specialization:
          technician.specialization,
        assignedBlocks:
          technician.assignedBlocks,
      },
    });
  } catch (error) {
    console.error(
      "Create technician error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create technician",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE TECHNICIAN
// SUPERVISOR CAN DELETE ONLY TECHNICIANS
// BELONGING TO HIS BLOCK
// =====================================================

const deleteTechnician = async (req, res) => {
  try {
    const supervisor = await User.findById(
      req.user.userId
    ).select("role assignedBlocks");

    if (
      !supervisor ||
      supervisor.role !== "supervisor"
    ) {
      return res.status(403).json({
        message: "Access denied. Supervisor only.",
      });
    }

    const technician = await User.findOne({
      _id: req.params.id,
      role: "technician",
      assignedBlocks: {
        $in: supervisor.assignedBlocks || [],
      },
    });

    if (!technician) {
      return res.status(404).json({
        message:
          "Technician not found or you are not authorized to delete this technician.",
      });
    }

    await User.findByIdAndDelete(
      technician._id
    );

    return res.json({
      message:
        "Technician deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete technician error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete technician",
      error: error.message,
    });
  }
};

module.exports = {
  getTechnicians,
  createTechnician,
  deleteTechnician,
};