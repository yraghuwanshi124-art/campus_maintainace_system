const User = require("../models/User");

const getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({
      role: "technician",
    }).select("name email");

    res.json({
      technicians,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch technicians",
      error: error.message,
    });
  }
};

module.exports = {
  getTechnicians,
};