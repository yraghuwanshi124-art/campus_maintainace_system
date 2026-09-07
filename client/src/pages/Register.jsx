import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [classSection, setClassSection] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");

        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        try {
            await api.post("/auth/register", {
                name,
                email,
                password,
                classSection,
            });

            setMessage("OTP sent to your email!");

            setTimeout(() => {
                navigate("/verify-otp", {
                    state: { email },
                });
            }, 500);

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Registration failed"
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-5">

            <div className="w-full max-w-md">

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">

                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-800">
                            Create Account
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Register as a student to report campus issues
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">

                        {/* Name */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>
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
                        {/* Email */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white transition hover:bg-indigo-700"
                        >
                            Create Account
                        </button>

                    </form>

                    {message && (
                        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-center font-medium">
                            {message}
                        </div>
                    )}

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