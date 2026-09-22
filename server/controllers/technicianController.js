const User = require("../models/User");
const bcrypt = require("bcryptjs");

// =====================================================
// GET ALL TECHNICIANS
// =====================================================

const getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({
      role: "technician",
    }).select("name email specialization");

    res.json({
      technicians,
    });
  } catch (error) {
    console.error("Get technicians error:", error);

    res.status(500).json({
      message: "Failed to fetch technicians",
      error: error.message,
    });
  }
};

// =====================================================
// ADD NEW TECHNICIAN
// =====================================================

const createTechnician = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
    } = req.body;

    // Required fields
    if (
      !name ||
      !email ||
      !password ||
      !specialization
    ) {
      return res.status(400).json({
        message: "All technician details are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create technician
    const technician = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "technician",
      specialization,
      classSection: "Staff",
      isVerified: true,
    });

    res.status(201).json({
      message: "Technician created successfully",
      technician: {
        _id: technician._id,
        name: technician.name,
        email: technician.email,
        specialization: technician.specialization,
      },
    });
  } catch (error) {
    console.error("Create technician error:", error);

    res.status(500).json({
      message: "Failed to create technician",
      error: error.message,
    });
  }
};
// =====================================================
// DELETE TECHNICIAN
// =====================================================

const deleteTechnician = async (req, res) => {
  try {
    const technician = await User.findOne({
      _id: req.params.id,
      role: "technician",
    });

    if (!technician) {
      return res.status(404).json({
        message: "Technician not found",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "Technician deleted successfully",
    });
  } catch (error) {
    console.error("Delete technician error:", error);

    res.status(500).json({
      message: "Failed to delete technician",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE DEFAULT TECHNICIANS
// =====================================================

const createDefaultTechnicians = async (req, res) => {
  try {
    const technicians = [
      // Electricians
      {
        name: "Rahul Sharma",
        email: "rahul.electrician@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "Electrician",
        classSection: "Staff",
        isVerified: true,
      },
      {
        name: "Rohit Yadav",
        email: "rohit.electrician@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "Electrician",
        classSection: "Staff",
        isVerified: true,
      },

      // AC Technicians
      {
        name: "Saurav Kumar",
        email: "saurav.ac@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "AC Technician",
        classSection: "Staff",
        isVerified: true,
      },
      {
        name: "Rohit Sharma",
        email: "rohit.ac@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "AC Technician",
        classSection: "Staff",
        isVerified: true,
      },

      // Computer Technicians
      {
        name: "Kunal Patel",
        email: "kunal.computer@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "Computer Technician",
        classSection: "Staff",
        isVerified: true,
      },
      {
        name: "Abhishek Singh",
        email: "abhishek.computer@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "Computer Technician",
        classSection: "Staff",
        isVerified: true,
      },

      // Plumbers
      {
        name: "Sunil Verma",
        email: "sunil.plumber@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "Plumber",
        classSection: "Staff",
        isVerified: true,
      },
      {
        name: "Manoj Yadav",
        email: "manoj.plumber@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "Plumber",
        classSection: "Staff",
        isVerified: true,
      },

      // Carpenters
      {
        name: "Ankit Sharma",
        email: "ankit.carpenter@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "Carpenter",
        classSection: "Staff",
        isVerified: true,
      },
      {
        name: "Ravi Patel",
        email: "ravi.carpenter@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "Carpenter",
        classSection: "Staff",
        isVerified: true,
      },

      // General Technicians
      {
        name: "Akash Verma",
        email: "akash.general@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "General",
        classSection: "Staff",
        isVerified: true,
      },
      {
        name: "Sumit Jain",
        email: "sumit.general@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "technician",
        specialization: "General",
        classSection: "Staff",
        isVerified: true,
      },
    ];

    const createdTechnicians = [];

    for (const technician of technicians) {
      const existing = await User.findOne({
        email: technician.email,
      });

      if (!existing) {
        const newTechnician =
          await User.create(technician);

        createdTechnicians.push({
          name: newTechnician.name,
          email: newTechnician.email,
          specialization:
            newTechnician.specialization,
        });
      }
    }

    res.status(201).json({
      message:
        "Default technicians created successfully",
      technicians: createdTechnicians,
    });
  } catch (error) {
    console.log(
      "Create technicians error:",
      error
    );

    res.status(500).json({
      message: "Failed to create technicians",
      error: error.message,
    });
  }
};

module.exports = {
  getTechnicians,
  createTechnician,
  deleteTechnician,
  createDefaultTechnicians,
};