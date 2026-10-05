
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ================= CREATE ADMIN =================

const createAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      password,
      assignedBlocks,
    } = req.body;

    // ================= REQUIRED FIELDS =================

    if (
      !name ||
      !email ||
      !phoneNumber ||
      !password ||
      !assignedBlocks ||
      !Array.isArray(assignedBlocks) ||
      assignedBlocks.length === 0
    ) {
      return res.status(400).json({
        message:
          "Name, email, phone number, password and assigned blocks are required.",
      });
    }

    // ================= CHECK EXISTING EMAIL =================

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account already exists with this email.",
      });
    }

    // ================= HASH PASSWORD =================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ================= CREATE ADMIN =================

    const admin = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      password: hashedPassword,
      role: "admin",
      assignedBlocks,
      classSection: "ADMIN",
      isVerified: true,
      registrationEmailVerified: true,
    });

    return res.status(201).json({
      message: "Admin created successfully.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        assignedBlocks: admin.assignedBlocks,
      },
    });
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);

    return res.status(500).json({
      message: "Failed to create admin.",
      error: error.message,
    });
  }
};

module.exports = {
  createAdmin,
};
