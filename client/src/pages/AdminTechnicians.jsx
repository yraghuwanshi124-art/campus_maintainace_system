import { useEffect, useState } from "react";
import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import LogoutModal from "../components/LogoutModal";

function AdminTechnicians() {
    const [technicians, setTechnicians] = useState([]);
    const [showLogout, setShowLogout] = useState(false);

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        specialization: "General",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] =
        useState("");

    // =====================================================
    // FETCH TECHNICIANS
    // =====================================================

    const fetchTechnicians = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get("/technicians", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setTechnicians(
                response.data.technicians || []
            );
        } catch (error) {
            console.log(
                "Failed to fetch technicians:",
                error
            );
        }
    };

    useEffect(() => {
        fetchTechnicians();
    }, []);

    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // =====================================================
    // ADD TECHNICIAN
    // =====================================================

    const handleAddTechnician = async (e) => {
        e.preventDefault();

        setMessage("");
        setErrorMessage("");

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.specialization
        ) {
            setErrorMessage(
                "Please fill in all fields."
            );
            return;
        }

        if (formData.password.length < 6) {
            setErrorMessage(
                "Password must be at least 6 characters."
            );
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await api.post(
                "/technicians",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage(
                response.data.message ||
                "Technician added successfully."
            );

            setFormData({
                name: "",
                email: "",
                password: "",
                specialization: "General",
            });

            setShowPassword(false);

            await fetchTechnicians();

            setTimeout(() => {
                setShowAddModal(false);
                setMessage("");
            }, 1200);
        } catch (error) {
            console.log(
                "Add technician error:",
                error.response?.data || error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Failed to add technician."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {
        if (loading) return;

        setShowAddModal(false);

        setFormData({
            name: "",
            email: "",
            password: "",
            specialization: "General",
        });

        setMessage("");
        setErrorMessage("");
        setShowPassword(false);
    };

    const handleDeleteTechnician = async (technicianId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this technician?"
        );

        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");

            await api.delete(`/technicians/${technicianId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            await fetchTechnicians();
        } catch (error) {
            console.log(
                "Delete technician error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete technician."
            );
        }
    };



    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <AdminSidebar
                onLogout={() => setShowLogout(true)}
            />

            <div className="lg:ml-64">
                {/* Header */}
                <div className="border-b border-slate-200 bg-white px-6 py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">
                                Technicians
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                View and manage all maintenance technicians
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowAddModal(true);
                                setMessage("");
                                setErrorMessage("");
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
                        >
                            <span className="text-lg">+</span>
                            Add New Technician
                        </button>
                    </div>
                </div>

                <main className="p-6">
                    {/* Stats */}
                    <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-indigo-100">
                                        Total Technicians
                                    </p>

                                    <h2 className="mt-2 text-3xl font-black">
                                        {technicians.length}
                                    </h2>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                                    👨‍🔧
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Specializations
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-slate-800">
                                {
                                    new Set(
                                        technicians.map(
                                            (technician) =>
                                                technician.specialization
                                        )
                                    ).size
                                }
                            </h2>
                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Account Status
                            </p>

                            <div className="mt-3 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>

                                <span className="font-bold text-emerald-600">
                                    All Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Technician List */}
                    {technicians.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                                👨‍🔧
                            </div>

                            <h3 className="mt-5 text-lg font-black text-slate-800">
                                No technicians found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                Add your first technician to start
                                assigning maintenance complaints.
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                            >
                                + Add Technician
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {technicians.map((technician) => (
                                <div
                                    key={technician._id}
                                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                                >
                                    {/* Top */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                                            👨‍🔧
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate font-black text-slate-800">
                                                {technician.name}
                                            </h3>

                                            <p className="mt-1 truncate text-sm text-slate-500">
                                                {technician.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Specialization
                                            </span>

                                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                                                {technician.specialization ||
                                                    "General"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Role
                                            </span>

                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                Technician
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteTechnician(technician._id)
                                        }
                                        className="mt-5 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                                    >
                                        🗑️ Delete Technician
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* =====================================================
          ADD TECHNICIAN MODAL
      ===================================================== */}

            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                                        👨‍🔧
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-black text-slate-800">
                                            Add New Technician
                                        </h2>

                                        <p className="text-xs text-slate-500">
                                            Create a technician account
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={loading}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleAddTechnician}
                            className="space-y-5 p-6"
                        >
                            {/* Name */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter technician name"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="technician@medicaps.ac.in"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                />
                            </div>

                            {/* Specialization */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Specialization
                                </label>

                                <select
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                >
                                    <option value="Electrician">
                                        Electrician
                                    </option>

                                    <option value="Computer Technician">
                                        Computer Technician
                                    </option>

                                    <option value="AC Technician">
                                        AC Technician
                                    </option>

                                    <option value="Carpenter">
                                        Carpenter
                                    </option>

                                    <option value="Plumber">
                                        Plumber
                                    </option>

                                    <option value="General">
                                        General
                                    </option>
                                </select>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Initial Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Minimum 6 characters"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100"
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {errorMessage && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                    ⚠️ {errorMessage}
                                </div>
                            )}

                            {/* Success */}
                            {message && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">
                                    ✓ {message}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 border-t border-slate-100 pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={loading}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading
                                        ? "Creating..."
                                        : "Create Technician"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Logout Modal */}
            <LogoutModal
                isOpen={showLogout}
                onClose={() => setShowLogout(false)}
            />
        </div>
    );
}

export default AdminTechnicians;