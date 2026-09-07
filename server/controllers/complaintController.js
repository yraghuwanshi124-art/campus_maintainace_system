
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const {
  sendComplaintNotification,
  sendTechnicianAssignmentEmail,
  sendComplaintResolvedEmail,
} = require("../services/emailService");

// Create Complaint
const createComplaint = async (req, res) => {
  try {
    const {
      block,
      room,
      category,
      description,
      priority,
      image,
    } = req.body;

    const complaint = await Complaint.create({
      user: req.user.userId,
      block,
      room,
      category,
      description,
      priority,
      image,
    });

    // Send email notification to admin
    await sendComplaintNotification(complaint);

    res.status(201).json({
      message: "Complaint created successfully",
      complaint,
    });
  } catch (error) {
    console.log("Create complaint error:", error);

    res.status(500).json({
      message: "Failed to create complaint",
      error: error.message,
    });
  }
};

// Get My Complaints
const getMyComplaints = async (req, res) => {
  try {
const complaints = await Complaint.find({
  user: req.user.userId,
})
  .populate("user", "name email classSection")
  .sort({ createdAt: -1 });

    res.json({
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

// Get All Complaints
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email classSection")
      .sort({ createdAt: -1 });

    res.json({
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

// Get Assigned Complaints
const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      technician: req.user.userId,
    })
      .populate("user", "name email classSection")
      .sort({ createdAt: -1 });

    res.json({
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch assigned complaints",
      error: error.message,
    });
  }
};

// Update Complaint Status
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Assigned",
      "In Progress",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const complaint = await Complaint.findOneAndUpdate(
      {
        _id: req.params.id,
        technician: req.user.userId,
      },
      {
        status,
      },
      {
        new: true,
      }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    // Send email to admin when complaint is resolved
    if (status === "Resolved") {
      await sendComplaintResolvedEmail(complaint);
    }

    res.json({
      message: "Complaint status updated",
      complaint,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update complaint status",
      error: error.message,
    });
  }
};


// Assign Complaint
const assignComplaint = async (req, res) => {
  try {
    const { technicianId } = req.body;

    // Check complaint first
    const existingComplaint = await Complaint.findById(req.params.id);

    if (!existingComplaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    // Prevent reassignment of resolved complaint
    if (existingComplaint.status === "Resolved") {
      return res.status(400).json({
        message: "Resolved complaint cannot be reassigned",
      });
    }

    // Check technician
    const technician = await User.findOne({
      _id: technicianId,
      role: "technician",
    });

    if (!technician) {
      return res.status(404).json({
        message: "Technician not found",
      });
    }

    // Assign complaint
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        technician: technicianId,
        status: "Assigned",
      },
      {
        new: true,
      }
    );

    // Send notification to technician
    await sendTechnicianAssignmentEmail(
      complaint,
      technician
    );

    res.json({
      message: "Complaint assigned successfully",
      complaint,
    });

  } catch (error) {
    console.log("Assign complaint error:", error);

    res.status(500).json({
      message: "Failed to assign complaint",
      error: error.message,
    });
  }
};


const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete complaint",
      error: error.message,
    });
  }
};

const uploadCompletionPhoto = async (req, res) => {
  try {
    const { completionImage } = req.body;

    if (!completionImage) {
      return res.status(400).json({
        message: "Completion photo is required",
      });
    }

    const complaint = await Complaint.findOneAndUpdate(
      {
        _id: req.params.id,
        technician: req.user.userId,
      },
      {
        completionImage,
      },
      {
        new: true,
      }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found or not assigned to you",
      });
    }

    res.json({
      message: "Completion photo uploaded successfully",
      complaint,
    });
  } catch (error) {
    console.log("Completion photo error:", error);

    res.status(500).json({
      message: "Failed to upload completion photo",
      error: error.message,
    });
  }
};
module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getAssignedComplaints,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  uploadCompletionPhoto,
};