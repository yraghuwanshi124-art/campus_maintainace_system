
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

    // Validate required complaint details
    if (
      !block?.trim() ||
      !room?.trim() ||
      !category?.trim() ||
      !description?.trim() ||
      !image
    ) {
      return res.status(400).json({
        message:
          "Block, room, category, description and complaint photo are required.",
      });
    }

    /*
      Duplicate Complaint Detection

      If an active complaint already exists for the same:
      - Block
      - Room
      - Category

      then do not create another complaint.

      Resolved complaints are intentionally excluded because
      the same issue can happen again after being resolved.
    */
    const existingComplaint = await Complaint.findOne({
      block: block.trim(),
      room: room.trim(),
      category: category.trim(),
      status: {
        $in: ["Pending", "Assigned", "In Progress"],
      },
    })
      .populate(
        "user",
        "name email enrollmentNumber department semester classSection"
      )
      .populate("technician", "name email");

    if (existingComplaint) {
      const currentUserId = req.user.userId.toString();

      const isOriginalReporter =
        existingComplaint.user?._id?.toString() === currentUserId;

      const hasAlreadySupported =
        existingComplaint.supporters?.some(
          (supporterId) => supporterId.toString() === currentUserId
        );

      return res.status(409).json({
        message: "A similar active complaint already exists.",
        duplicate: true,
        alreadyReported: isOriginalReporter,
        alreadySupported: hasAlreadySupported,
        complaint: existingComplaint,
      });
    }

    // Create new complaint
    const complaint = await Complaint.create({
      user: req.user.userId,
      block: block.trim(),
      room: room.trim(),
      category: category.trim(),
      description: description.trim(),
      priority,
      image,
      supporters: [],
    });

    // Send email notification to admin
    await sendComplaintNotification(complaint);

    res.status(201).json({
      message: "Complaint created successfully",
      duplicate: false,
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

// Support Existing Complaint
const supportComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      status: {
        $in: ["Pending", "Assigned", "In Progress"],
      },
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Active complaint not found",
      });
    }

    const userId = req.user.userId.toString();

    // Original reporter cannot support their own complaint
    if (complaint.user.toString() === userId) {
      return res.status(400).json({
        message: "You are already the original reporter of this complaint",
      });
    }

    // Prevent same student from supporting multiple times
    const alreadySupported = complaint.supporters?.some(
      (supporterId) => supporterId.toString() === userId
    );

    if (alreadySupported) {
      return res.status(400).json({
        message: "You have already supported this complaint",
      });
    }

    complaint.supporters.push(req.user.userId);

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate(
        "user",
        "name email enrollmentNumber department semester classSection"
      )
      .populate("technician", "name email")
      .populate(
        "supporters",
        "name email enrollmentNumber department semester classSection"
      );

    res.json({
      message: "Complaint supported successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.log("Support complaint error:", error);

    res.status(500).json({
      message: "Failed to support complaint",
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
      .populate(
        "user",
        "name email enrollmentNumber department semester classSection"
      )
      .populate("technician", "name email")
      .populate(
        "supporters",
        "name email enrollmentNumber department semester classSection"
      )
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
      .populate(
        "user",
        "name email enrollmentNumber department semester classSection"
      )
      .populate("technician", "name email")
      .populate(
        "supporters",
        "name email enrollmentNumber department semester classSection"
      )
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
      .populate(
        "supporters",
        "name email enrollmentNumber department semester classSection"
      )
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
        ...(status === "Resolved" && {
          resolvedAt: new Date(),
        }),
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
        assignedAt: new Date(),
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

// Delete Complaint
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

// Upload Completion Photo
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

// Submit Feedback
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    if (complaint.status !== "Resolved") {
      return res.status(400).json({
        message: "Feedback can be given only after complaint is resolved",
      });
    }

    if (complaint.feedbackRating) {
      return res.status(400).json({
        message: "Feedback has already been submitted",
      });
    }

    complaint.feedbackRating = Number(rating);
    complaint.feedbackComment = comment?.trim() || "";

    await complaint.save();

    res.json({
      message: "Feedback submitted successfully",
      complaint,
    });
  } catch (error) {
    console.log("Submit feedback error:", error);

    res.status(500).json({
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

module.exports = {
  createComplaint,
  supportComplaint,
  getMyComplaints,
  getAllComplaints,
  getAssignedComplaints,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  uploadCompletionPhoto,
  submitFeedback,
};
