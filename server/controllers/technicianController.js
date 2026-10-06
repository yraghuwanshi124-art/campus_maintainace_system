
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// =====================================================
// GET TECHNICIANS
// SUPERVISOR CAN SEE ALL COLLEGE TECHNICIANS
// =====================================================

const getTechnicians = async (req, res) => {
  try {
    const supervisor = await User.findById(
      req.user.userId
    ).select("role");

    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(403).json({
        message: "Access denied. Supervisor only.",
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
      "GET TECHNICIANS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch technicians.",
      error: error.message,
    });
  }
};

// =====================================================
// ADD NEW TECHNICIAN
// TECHNICIAN IS COMMON FOR THE WHOLE COLLEGE
// NO FIXED BLOCK
// =====================================================

const createTechnician = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !specialization
    ) {
      return res.status(400).json({
        message:
          "Name, email, password and specialization are required.",
      });
    }

    const supervisor = await User.findById(
      req.user.userId
    ).select("role");

    if (
      !supervisor ||
      supervisor.role !== "supervisor"
    ) {
      return res.status(403).json({
        message: "Access denied. Supervisor only.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail =
      email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "An account with this email already exists.",
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
      assignedBlocks: [],
      classSection: "Staff",
      isVerified: true,
      registrationEmailVerified: true,
    });

    return res.status(201).json({
      message:
        "Technician created successfully.",
      technician: {
        _id: technician._id,
        name: technician.name,
        email: technician.email,
        specialization:
          technician.specialization,
      },
    });
  } catch (error) {
    console.error(
      "CREATE TECHNICIAN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create technician.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE TECHNICIAN
// SUPERVISOR CAN DELETE ANY COLLEGE TECHNICIAN
// =====================================================

const deleteTechnician = async (req, res) => {
  try {
    const supervisor = await User.findById(
      req.user.userId
    ).select("role");

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
    });

    if (!technician) {
      return res.status(404).json({
        message: "Technician not found.",
      });
    }

    await User.findByIdAndDelete(
      technician._id
    );

    return res.json({
      message:
        "Technician deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE TECHNICIAN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete technician.",
      error: error.message,
    });
  }
};

module.exports = {
  getTechnicians,
  createTechnician,
  deleteTechnician,
};
