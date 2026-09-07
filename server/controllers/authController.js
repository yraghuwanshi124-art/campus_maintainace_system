const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendVerificationOTP } = require("../services/emailService");

// ================= REGISTER =================

const registerUser = async (req, res) => {
    try {
        const { name, email, password, classSection } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({
                    message: "User already exists",
                });
            }

            // Unverified user hai, to naya OTP bhej do
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            existingUser.verificationOTP = otp;
            existingUser.verificationOTPExpires =
                new Date(Date.now() + 10 * 60 * 1000);

            await existingUser.save();

            await sendVerificationOTP(email, otp);

            return res.status(200).json({
                message: "OTP sent to your email",
                email,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

const user = await User.create({
  name,
  email,
  password: hashedPassword,
  role: "student",
  classSection: classSection,
  verificationOTP: otp,
  verificationOTPExpires: new Date(
    Date.now() + 10 * 60 * 1000
  ),
  isVerified: false,
});

        await sendVerificationOTP(email, otp);

        res.status(201).json({
            message: "OTP sent to your email",
            email: user.email,
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
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

        const user = await User.findOne({ email }).select(
            "+verificationOTP +verificationOTPExpires"
        );

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


// ================= LOGIN =================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

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


module.exports = {
    registerUser,
    verifyOTP,
    loginUser,
};