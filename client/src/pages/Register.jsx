import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
const navigate = useNavigate();

// ================= STEP =================

const [step, setStep] = useState(1);

// ================= STUDENT DETAILS =================

const [name, setName] = useState("");
const [enrollmentNumber, setEnrollmentNumber] = useState("");
const [email, setEmail] = useState("");
const [phoneNumber, setPhoneNumber] = useState("");
const [department, setDepartment] = useState("");
const [branch , setBranch] = useState("");
const [semester, setSemester] = useState("");
const [classSection, setClassSection] = useState("");

// ================= OTP =================

const [emailOTP, setEmailOTP] = useState("");

// ================= PASSWORD =================

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

// ================= UI =================

const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

// ================= PASSWORD REQUIREMENTS =================

const passwordRequirements = [
    {
        id: "length",
        label: "At least 8 characters",
        met: password.length >= 8,
    },
    {
        id: "uppercase",
        label: "At least 1 uppercase letter (A-Z)",
        met: /[A-Z]/.test(password),
    },
    {
        id: "lowercase",
        label: "At least 1 lowercase letter (a-z)",
        met: /[a-z]/.test(password),
    },
    {
        id: "number",
        label: "At least 1 number (0-9)",
        met: /[0-9]/.test(password),
    },
    {
        id: "special",
        label: "At least 1 special character (@, #, $, %, etc.)",
        met: /[^A-Za-z0-9]/.test(password),
    },
];

const isPasswordStrong = passwordRequirements.every(
    (req) => req.met
);

const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

const passwordsMismatch =
    confirmPassword.length > 0 &&
    password !== confirmPassword;

// ================= MESSAGE =================

const showError = (text) => {
    setMessage(text);
};

// ================= STEP 1 =================
// STUDENT DETAILS + SEND EMAIL OTP

const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    // Name
    if (!name.trim()) {
        showError("Please enter your full name.");
        return;
    }

    // Enrollment
    if (
        !/^[A-Za-z0-9]+$/.test(
            enrollmentNumber.trim()
        )
    ) {
        showError("Please enter a valid enrollment number.");
        return;
    }

    // Email
    if (
        !email
            .trim()
            .toLowerCase()
            .endsWith("@medicaps.ac.in")
    ) {
        showError(
            "Please use your Medi-Caps college email."
        );
        return;
    }

    // Phone
    const normalizedPhone = phoneNumber
        .replace(/\s+/g, "")
        .trim();

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
        showError(
            "Please enter a valid 10-digit Indian mobile number."
        );
        return;
    }

    // Department
    if (!department.trim()) {
        showError("Please enter your department.");
        return;
    }

    if(!branch.trim()) {
        showError("Please enter your branch.");
        return;
    }

    // Semester
    if (!semester) {
        showError("Please select your semester.");
        return;
    }

    // Section
    if (!classSection.trim()) {
        showError("Please enter your class / section.");
        return;
    }

    setLoading(true);

    try {
        const response = await api.post(
            "/auth/register",
            {
                name: name.trim(),

                enrollmentNumber:
                    enrollmentNumber
                        .trim()
                        .toUpperCase(),

                email: email
                    .trim()
                    .toLowerCase(),

                phoneNumber: normalizedPhone,

                department:
                    department.trim(),
                
                branch:
                    branch.trim(),

                semester: Number(semester),

                classSection:
                    classSection.trim(),
            }
        );

        setMessage(
            response.data?.message ||
            "Email OTP sent successfully."
        );

        setStep(2);
    } catch (error) {
        setMessage(
            error.response?.data?.message ||
            "Unable to start registration."
        );
    } finally {
        setLoading(false);
    }
};

// ================= STEP 2 =================
// VERIFY EMAIL OTP

const handleVerifyEmailOTP = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!emailOTP.trim()) {
        showError("Please enter the email OTP.");
        return;
    }

    if (emailOTP.trim().length !== 6) {
        showError("Email OTP must be 6 digits.");
        return;
    }

    setLoading(true);

    try {
        const response = await api.post(
            "/auth/verify-otp",
            {
                email: email
                    .trim()
                    .toLowerCase(),

                otp: emailOTP.trim(),
            }
        );

        setMessage(
            response.data?.message ||
            "Email verified successfully. Create your password."
        );

        setStep(3);
    } catch (error) {
        setMessage(
            error.response?.data?.message ||
            "Email OTP verification failed."
        );
    } finally {
        setLoading(false);
    }
};

// ================= STEP 3 =================
// CREATE PASSWORD + ACCOUNT

const handleCreateAccount = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!isPasswordStrong) {
        showError(
            "Please satisfy all password requirements."
        );
        return;
    }

    if (password !== confirmPassword) {
        showError("Passwords do not match.");
        return;
    }

    setLoading(true);

    try {
        const response = await api.post(
            "/auth/complete-registration",
            {
                email: email
                    .trim()
                    .toLowerCase(),

                password,

                confirmPassword,
            }
        );

        setMessage(
            response.data?.message ||
            "Account created successfully."
        );

        setTimeout(() => {
            navigate("/");
        }, 1200);
    } catch (error) {
        setMessage(
            error.response?.data?.message ||
            "Unable to create account."
        );
    } finally {
        setLoading(false);
    }
};

// ================= BACK BUTTON =================

const handleBack = () => {
    setMessage("");

    if (step === 2) {
        setEmailOTP("");
        setStep(1);
        return;
    }

    if (step === 3) {
        setPassword("");
        setConfirmPassword("");
        setStep(2);
    }
};

// ================= STEP TITLE =================

const getStepTitle = () => {
    if (step === 1) {
        return "Student Details";
    }

    if (step === 2) {
        return "Verify College Email";
    }

    return "Create Password";
};

// ================= RENDER =================

return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-5 py-10">

        <div className="w-full max-w-md">

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">

                {/* Header */}

                <div className="mb-7 text-center">

                    <h1 className="text-3xl font-bold text-slate-800">
                        Create Account
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        {getStepTitle()}
                    </p>

                </div>

                {/* Progress */}

                <div className="mb-8">

                    <div className="flex items-center justify-center">

                        {[1, 2, 3].map((number) => (
                            <div
                                key={number}
                                className="flex items-center"
                            >

                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                        step >= number
                                            ? "bg-indigo-600 text-white"
                                            : "bg-slate-200 text-slate-500"
                                    }`}
                                >
                                    {number}
                                </div>

                                {number < 3 && (
                                    <div
                                        className={`h-1 w-12 sm:w-20 ${
                                            step > number
                                                ? "bg-indigo-600"
                                                : "bg-slate-200"
                                        }`}
                                    />
                                )}

                            </div>
                        ))}

                    </div>

                    <div className="mt-2 flex justify-center gap-10 text-[10px] font-semibold text-slate-400 sm:gap-16">
                        <span>Details</span>
                        <span>Email OTP</span>
                        <span>Password</span>
                    </div>

                </div>

                {/* ================= STEP 1 ================= */}

                {step === 1 && (
                    <form
                        onSubmit={handleRegister}
                        className="space-y-5"
                    >

                        {/* Full Name */}

                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
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
                                    setEnrollmentNumber(
                                        e.target.value.toUpperCase()
                                    )
                                }
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 uppercase outline-none focus:border-indigo-500 focus:bg-white"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                Enter your official college enrollment number
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
                                onChange={(e) =>
                                    setDepartment(
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>

                        {/* Branch */}
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Branch
                            </label>
                            <input type="text" 
                            placeholder="e.g. AI (IBM)"
                            onChange={(e) => 
                                setBranch(
                                    e.target.value
                                )
                            }
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
                                onChange={(e) =>
                                    setSemester(
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            >
                                <option value="">
                                    Select Semester
                                </option>

                                {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                    (sem) => (
                                        <option
                                            key={sem}
                                            value={sem}
                                        >
                                            {sem}
                                            {sem === 1
                                                ? "st"
                                                : sem === 2
                                                ? "nd"
                                                : sem === 3
                                                ? "rd"
                                                : "th"}{" "}
                                            Semester
                                        </option>
                                    )
                                )}
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
                                onChange={(e) =>
                                    setClassSection(
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>

                        {/* Phone Number */}

                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="Enter 10-digit mobile number"
                                value={phoneNumber}
                                onChange={(e) =>
                                    setPhoneNumber(
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                Phone verification will be added later.
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
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                Use your @medicaps.ac.in email
                            </p>
                        </div>

                        {/* Info */}

                        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                            Your Medi-Caps email will be verified using a one-time OTP before you create your password.
                        </div>

                        {/* Continue */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Sending OTP..."
                                : "Continue & Send Email OTP"}
                        </button>

                    </form>
                )}

                {/* ================= STEP 2 ================= */}

                {step === 2 && (
                    <form
                        onSubmit={handleVerifyEmailOTP}
                        className="space-y-5"
                    >

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">

                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                                ✉️
                            </div>

                            <h2 className="font-bold text-slate-800">
                                Verify your college email
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Enter the 6-digit OTP sent to your Medi-Caps email.
                            </p>

                            <p className="mt-2 break-all text-xs font-semibold text-slate-600">
                                {email}
                            </p>

                        </div>

                        <div>
                            <label className="mb-2 block font-semibold text-slate-700">
                                Email OTP
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={emailOTP}
                                onChange={(e) =>
                                    setEmailOTP(
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }
                                required
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-center text-xl font-bold tracking-[0.4em] outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                emailOTP.length !== 6
                            }
                            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Verifying..."
                                : "Verify Email"}
                        </button>

                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={loading}
                            className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            ← Back
                        </button>

                    </form>
                )}

                {/* ================= STEP 3 ================= */}

                {step === 3 && (
                    <form
                        onSubmit={handleCreateAccount}
                        className="space-y-5"
                    >

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">

                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                                ✓
                            </div>

                            <h2 className="font-bold text-slate-800">
                                Email Verified
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Your college email has been verified. Now create your CampusFix password.
                            </p>

                        </div>

                        {/* Create Password */}

                        <div>

                            <label className="mb-2 block font-semibold text-slate-700">
                                Create Password
                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 pr-12 outline-none transition focus:bg-white ${
                                        password.length > 0
                                            ? isPasswordStrong
                                                ? "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                : "border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                            : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    }`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-indigo-600"
                                >
                                    {showPassword
                                        ? "◉"
                                        : "○"}
                                </button>

                            </div>

                            {/* Password Requirements */}

                            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                                <div className="mb-2.5 flex items-center justify-between">

                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                        Password requirements:
                                    </p>

                                    <span
                                        className={`text-xs font-bold ${
                                            isPasswordStrong
                                                ? "text-emerald-600"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        {
                                            passwordRequirements.filter(
                                                (r) =>
                                                    r.met
                                            ).length
                                        }{" "}
                                        / 5 met
                                    </span>

                                </div>

                                <div className="space-y-1.5 text-xs">

                                    {passwordRequirements.map(
                                        (req) => (
                                            <div
                                                key={req.id}
                                                className={`flex items-center gap-2 ${
                                                    req.met
                                                        ? "font-medium text-emerald-700"
                                                        : "text-slate-500"
                                                }`}
                                            >

                                                <span
                                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                                        req.met
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-slate-200 text-slate-400"
                                                    }`}
                                                >
                                                    {req.met
                                                        ? "✓"
                                                        : "✗"}
                                                </span>

                                                <span>
                                                    {req.label}
                                                </span>

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* Confirm Password */}

                        <div>

                            <label className="mb-2 block font-semibold text-slate-700">
                                Re-enter Password
                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 pr-12 outline-none transition focus:bg-white ${
                                        passwordsMismatch
                                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            : passwordsMatch
                                            ? "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                            : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    }`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-indigo-600"
                                >
                                    {showConfirmPassword
                                        ? "◉"
                                        : "○"}
                                </button>

                            </div>

                            {confirmPassword && (
                                <p
                                    className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${
                                        passwordsMatch
                                            ? "text-emerald-600"
                                            : "text-red-500"
                                    }`}
                                >
                                    <span>
                                        {passwordsMatch
                                            ? "✓"
                                            : "✗"}
                                    </span>

                                    <span>
                                        {passwordsMatch
                                            ? "Passwords match"
                                            : "Passwords do not match"}
                                    </span>
                                </p>
                            )}

                        </div>

                        {/* Create Account */}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !isPasswordStrong ||
                                password !==
                                    confirmPassword
                            }
                            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={loading}
                            className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            ← Back
                        </button>

                    </form>
                )}

                {/* ================= MESSAGE ================= */}

                {message && (
                    <div
                        className={`mt-5 rounded-xl px-4 py-3 text-center text-sm font-medium ${
                            message.toLowerCase().includes(
                                "success"
                            ) ||
                            message
                                .toLowerCase()
                                .includes("sent") ||
                            message
                                .toLowerCase()
                                .includes("verified") ||
                            message
                                .toLowerCase()
                                .includes("created")
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* ================= LOGIN ================= */}

                <div className="mt-6 text-center">

                    <p className="text-sm text-slate-500">
                        Already have an account?
                    </p>

                    <button
                        type="button"
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
