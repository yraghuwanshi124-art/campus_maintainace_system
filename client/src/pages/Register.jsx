import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [enrollmentNumber, setEnrollmentNumber] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [semester, setSemester] = useState("");
    const [classSection, setClassSection] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");

        // Enrollment number format
        if (!/^[A-Za-z0-9]+$/.test(enrollmentNumber.trim())) {
            setMessage("Please enter a valid enrollment number");
            return;
        }

        // College email check
        if (!email.toLowerCase().endsWith("@medicaps.ac.in")) {
            setMessage("Please use your Medi-Caps college email");
            return;
        }

        // Password check
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register", {
                name: name.trim(),
                enrollmentNumber: enrollmentNumber.trim().toUpperCase(),
                email: email.trim().toLowerCase(),
                department: department.trim(),
                semester: Number(semester),
                classSection: classSection.trim(),
                password,
            });

            setMessage("OTP sent to your college email!");

            setTimeout(() => {
                navigate("/verify-otp", {
                    state: {
                        email: email.trim().toLowerCase(),
                    },
                });
            }, 700);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-5 py-10">

            <div className="w-full max-w-md">

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-800">
                            Create Account
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Register using your Medi-Caps student details
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">

                        {/* Full Name */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>

                        {/* Enrollment Number */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Enrollment Number
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. EN25CS3090250"
                                value={enrollmentNumber}
                                onChange={(e) =>
                                    setEnrollmentNumber(e.target.value.toUpperCase())
                                }
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 uppercase outline-none focus:border-indigo-500 focus:bg-white"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                Enter your official college enrollment number
                            </p>
                        </div>

                        {/* College Email */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                College Email
                            </label>

                            <input
                                type="email"
                                placeholder="enrollment@medicaps.ac.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                Use your @medicaps.ac.in email
                            </p>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Department
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. Computer Science"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>

                        {/* Semester */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Semester
                            </label>

                            <select
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            >
                                <option value="">Select Semester</option>
                                <option value="1">1st Semester</option>
                                <option value="2">2nd Semester</option>
                                <option value="3">3rd Semester</option>
                                <option value="4">4th Semester</option>
                                <option value="5">5th Semester</option>
                                <option value="6">6th Semester</option>
                                <option value="7">7th Semester</option>
                                <option value="8">8th Semester</option>
                            </select>
                        </div>

                        {/* Class / Section */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Class / Section
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. IBM-C"
                                value={classSection}
                                onChange={(e) => setClassSection(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>

                        {/* Info */}
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                            Your college email will be verified using OTP before
                            your account is activated.
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                    </form>

                    {/* Message */}
                    {message && (
                        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-center font-medium text-slate-700">
                            {message}
                        </div>
                    )}

                    {/* Login */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="mt-1 font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            Sign In
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Register;