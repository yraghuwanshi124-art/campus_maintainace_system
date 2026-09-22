const User = require("../models/User");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  sendVerificationOTP,
  sendPasswordResetOTP,
} = require("../services/emailService");

// ================= CHANGE PASSWORD =================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Server error while changing password",
    });
  }
};

// ================= REGISTER =================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      classSection,
      enrollmentNumber,
      department,
      semester,
    } = req.body;

    // ================= REQUIRED FIELDS =================

    if (
      !name ||
      !email ||
      !password ||
      !classSection ||
      !enrollmentNumber ||
      !department ||
      !semester
    ) {
      return res.status(400).json({
        message: "All student details are required",
      });
    }

    // ================= COLLEGE EMAIL CHECK =================

    const normalizedEmail = email.trim().toLowerCase();

    const normalizedEnrollment =
      enrollmentNumber.trim().toUpperCase();

    if (!normalizedEmail.endsWith("@medicaps.ac.in")) {
      return res.status(400).json({
        message: "Please use your Medi-Caps college email.",
      });
    }

    // ================= ENROLLMENT CHECK =================

    if (!/^[A-Z0-9]+$/.test(normalizedEnrollment)) {
      return res.status(400).json({
        message: "Invalid enrollment number.",
      });
    }

    // ================= CHECK EXISTING ACCOUNT =================

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { enrollmentNumber: normalizedEnrollment },
      ],
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          message: "Student account already exists.",
        });
      }

      // Existing unverified account → send new OTP

      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      existingUser.verificationOTP = otp;

      existingUser.verificationOTPExpires = new Date(
        Date.now() + 10 * 60 * 1000
      );

      await existingUser.save();

      await sendVerificationOTP(normalizedEmail, otp);

      return res.status(200).json({
        message: "OTP sent to your college email.",
        email: normalizedEmail,
      });
    }

    // ================= HASH PASSWORD =================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ================= GENERATE OTP =================

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // ================= CREATE USER =================

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,

      role: "student",

      enrollmentNumber: normalizedEnrollment,
      department: department.trim(),
      semester: Number(semester),
      classSection: classSection.trim(),

      verificationOTP: otp,

      verificationOTPExpires: new Date(
        Date.now() + 10 * 60 * 1000
      ),

      isVerified: false,
    });

    // ================= SEND OTP =================

    await sendVerificationOTP(normalizedEmail, otp);

    return res.status(201).json({
      message: "Account created. OTP sent to your college email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ================= VERIFY OTP =================

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+verificationOTP +verificationOTPExpires");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    if (!user.verificationOTP || !user.verificationOTPExpires) {
      return res.status(400).json({
        message: "OTP not found. Please register again.",
      });
    }

    if (user.verificationOTPExpires < new Date()) {
      return res.status(400).json({
        message: "OTP has expired. Please register again.",
      });
    }

    if (user.verificationOTP !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;

    await user.save();

    res.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+resetPasswordOTP +resetPasswordOTPExpires");

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    // ================= GENERATE RESET OTP =================

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.resetPasswordOTP = otp;

    user.resetPasswordOTPExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    // ================= SEND RESET OTP =================

    await sendPasswordResetOTP(normalizedEmail, otp);

    return res.status(200).json({
      message: "Password reset OTP sent to your email.",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Failed to send password reset OTP",
    });
  }
};

// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+resetPasswordOTP +resetPasswordOTPExpires +password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ================= CHECK OTP =================

    if (
      !user.resetPasswordOTP ||
      !user.resetPasswordOTPExpires
    ) {
      return res.status(400).json({
        message: "Reset OTP not found. Please request a new OTP.",
      });
    }

    if (user.resetPasswordOTPExpires < new Date()) {
      return res.status(400).json({
        message: "Reset OTP has expired. Please request a new OTP.",
      });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({
        message: "Invalid reset OTP",
      });
    }

    // ================= CHECK SAME PASSWORD =================

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // ================= HASH NEW PASSWORD =================

    user.password = await bcrypt.hash(newPassword, 10);

    // ================= CLEAR RESET OTP =================

    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
};

// ================= LOGIN =================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (user.role === "student" && !user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classSection: user.classSection,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// ================= EXPORTS =================

module.exports = {
  registerUser,
  verifyOTP,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
};