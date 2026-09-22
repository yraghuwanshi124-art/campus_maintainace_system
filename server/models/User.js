
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    enrollmentNumber: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    department: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },

    semester: {
      type: Number,
      required: function () {
        return this.role === "student";
      },
      min: 1,
      max: 8,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "admin", "technician"],
      default: "student",
    },

    specialization: {
      type: String,
      enum: [
        "Electrician",
        "Carpenter",
        "AC Technician",
        "Computer Technician",
        "Plumber",
        "General",
      ],
      default: "General",
    },

    classSection: {
      type: String,
      required: true,
      trim: true,
    },

    // ================= EMAIL VERIFICATION OTP =================

    verificationOTP: {
      type: String,
      select: false,
    },

    verificationOTPExpires: {
      type: Date,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ================= PASSWORD RESET OTP =================

    resetPasswordOTP: {
      type: String,
      select: false,
    },

    resetPasswordOTPExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
