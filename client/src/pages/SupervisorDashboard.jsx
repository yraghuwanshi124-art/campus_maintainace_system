
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SupervisorSidebar from "../components/SupervisorSidebar";

const SupervisorDashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const assignedBlocks = user?.assignedBlocks || [];

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/supervisor/complaints", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setComplaints(response.data.complaints || []);
      } catch (error) {
        console.error(
          "SUPERVISOR DASHBOARD COMPLAINTS ERROR:",
          error.response?.data || error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // =========================
  // STATISTICS
  // =========================

  const totalComplaints = complaints.length;

  const pendingAssignment = complaints.filter(
    (complaint) =>
      complaint.status === "Pending" || !complaint.technician
  ).length;

  const activeComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "Assigned" ||
      complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  // =========================
  // HELPERS
  // =========================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";

      case "Assigned":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "In Progress":
        return "bg-violet-100 text-violet-700 border-violet-200";

      case "Resolved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";

      case "Medium":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "Low":
        return "bg-green-100 text-green-700 border-green-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLocationText = (complaint) => {
    const parts = [];

    if (complaint.block) {
      parts.push(complaint.block);
    }

    if (complaint.floor) {
      parts.push(`Floor ${complaint.floor}`);
    }

    if (complaint.room) {
      parts.push(`Room ${complaint.room}`);
    }

    return parts.join(" • ");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SupervisorSidebar onLogout={handleLogout} />

      <main className="min-h-screen transition-all duration-300 lg:ml-64">
        {/* ================= HEADER ================= */}

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur-md sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="pl-14 lg:pl-0">
              <p className="text-sm font-bold text-slate-500">
                CampusFix
              </p>

              <p className="text-base font-black text-slate-800">
                {assignedBlocks.length
                  ? `${assignedBlocks.join(", ")} Supervisor`
                  : "Supervisor"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/supervisor/notifications")
              }
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg shadow-sm transition hover:bg-indigo-50"
              title="Notifications"
            >
              🔔

              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-8">
          {/* ================= HERO ================= */}

          <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-7 text-white shadow-xl sm:p-9">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-300"></span>

                  Supervisor Control Center
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {assignedBlocks.length
                    ? `${assignedBlocks.join(
                        ", "
                      )} Supervisor Dashboard`
                    : "Supervisor Dashboard"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                  Manage complaints assigned by Admin and coordinate
                  maintenance work with Technicians.
                </p>
              </div>

              <div className="hidden rounded-3xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-sm lg:block">
                <div className="text-4xl">🛠️</div>

                <p className="mt-2 text-sm font-bold text-indigo-100">
                  Operations
                </p>
              </div>
            </div>
          </section>

          {/* ================= STATS ================= */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* TOTAL */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Received from Admin
                  </p>

                  <p className="mt-4 text-3xl font-black text-slate-800">
                    {totalComplaints}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Total assigned complaints
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  📥
                </div>
              </div>
            </div>

            {/* PENDING */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Pending Assignment
                  </p>

                  <p className="mt-4 text-3xl font-black text-amber-600">
                    {pendingAssignment}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Need technician assignment
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                  ⏳
                </div>
              </div>
            </div>

            {/* ACTIVE */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Active Complaints
                  </p>

                  <p className="mt-4 text-3xl font-black text-violet-600">
                    {activeComplaints}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Assigned or in progress
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
                  🔧
                </div>
              </div>
            </div>

            {/* RESOLVED */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Resolved
                  </p>

                  <p className="mt-4 text-3xl font-black text-emerald-600">
                    {resolvedComplaints}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Completed maintenance work
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                  ✅
                </div>
              </div>
            </div>
          </section>

          {/* ================= MAIN CONTENT ================= */}

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            {/* ================= COMPLAINTS ================= */}

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
                      📋
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-slate-800">
                        Assigned Complaints
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Complaints received from Admin for your block.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/supervisor/complaints")
                  }
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700"
                >
                  View All →
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                      ⏳
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-700">
                      Loading complaints...
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Fetching your assigned maintenance complaints.
                    </p>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                      📋
                    </div>

                    <h3 className="mt-4 text-lg font-black text-slate-700">
                      No complaints available
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Complaints assigned to this Supervisor by Admin
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.slice(0, 3).map((complaint) => (
                      <div
                        key={complaint._id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:border-indigo-200 hover:bg-white hover:shadow-md"
                      >
                        {/* TOP */}

                        <div className="p-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-black text-indigo-700">
                                  {complaint.category}
                                </span>

                                <span
                                  className={`rounded-lg border px-2.5 py-1 text-xs font-black ${getStatusStyle(
                                    complaint.status
                                  )}`}
                                >
                                  {complaint.status}
                                </span>

                                <span
                                  className={`rounded-lg border px-2.5 py-1 text-xs font-black ${getPriorityStyle(
                                    complaint.priority
                                  )}`}
                                >
                                  {complaint.priority} Priority
                                </span>
                              </div>

                              <h3 className="mt-3 text-base font-black text-slate-800">
                                {complaint.category} Complaint
                              </h3>

                              <p className="mt-1 text-sm font-bold text-indigo-700">
                                📍 {getLocationText(complaint)}
                              </p>

                              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                {complaint.description}
                              </p>
                            </div>

                            {/* IMAGE */}

                            {complaint.image ? (
                              <div className="h-24 w-full overflow-hidden rounded-xl border border-slate-200 bg-white sm:w-32">
                                <img
                                  src={complaint.image}
                                  alt="Complaint"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-3xl sm:w-32">
                                🧰
                              </div>
                            )}
                          </div>

                          {/* INFO GRID */}

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-white p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Location
                              </p>

                              <p className="mt-1 text-sm font-black text-slate-700">
                                {getLocationText(complaint)}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Technician
                              </p>

                              <p className="mt-1 text-sm font-black text-slate-700">
                                {complaint.technician?.name ||
                                  "Not assigned"}
                              </p>
                            </div>
                          </div>

                          {/* TIMELINE */}

                          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
                              Complaint Timeline
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="flex gap-3">
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500"></div>

                                <div>
                                  <p className="text-xs font-black text-slate-700">
                                    Created
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {formatDate(complaint.createdAt)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500"></div>

                                <div>
                                  <p className="text-xs font-black text-slate-700">
                                    Assigned to Supervisor
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {formatDate(complaint.assignedAt)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500"></div>

                                <div>
                                  <p className="text-xs font-black text-slate-700">
                                    Technician Assigned
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {formatDate(
                                      complaint.technicianAssignedAt
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500"></div>

                                <div>
                                  <p className="text-xs font-black text-slate-700">
                                    Resolved
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {formatDate(
                                      complaint.resolvedAt
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ACTION */}

                          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs font-semibold text-slate-400">
                              Complaint ID:{" "}
                              {complaint._id?.slice(-8)}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  "/supervisor/complaints"
                                )
                              }
                              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-indigo-700"
                            >
                              Manage Complaint →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {complaints.length > 3 && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/supervisor/complaints")
                        }
                        className="w-full rounded-2xl border border-indigo-200 bg-indigo-50 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
                      >
                        View {complaints.length - 3} More Complaint
                        {complaints.length - 3 > 1 ? "s" : ""} →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ================= NOTIFICATIONS ================= */}

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-xl">
                    🔔
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-800">
                      Notifications
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Recent system updates
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    🔔
                  </div>

                  <h3 className="mt-4 text-base font-black text-slate-700">
                    Notification Center
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Check complaints assigned by Admin and other
                    important CampusFix updates.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/supervisor/notifications")
                    }
                    className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-indigo-700"
                  >
                    Open Notification Center
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ================= QUICK ACTIONS ================= */}

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-slate-800">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your daily maintenance operations.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={() =>
                  navigate("/supervisor/complaints")
                }
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                  📋
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-800">
                  Manage Complaints
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  View and assign technicians.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/supervisor/technicians")
                }
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-violet-200 hover:bg-violet-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-xl">
                  🛠️
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-800">
                  Manage Technicians
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Add and manage block technicians.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/supervisor/notifications")
                }
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-amber-200 hover:bg-amber-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl">
                  🔔
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-800">
                  Notifications
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Check important system updates.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/supervisor/complaints")
                }
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                  📊
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-800">
                  Track Progress
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Monitor complaint resolution.
                </p>
              </button>
            </div>
          </section>

          {/* ================= WORKFLOW ================= */}

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800">
                CampusFix Workflow
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your role in the campus maintenance process.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                  🎓
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-wide text-slate-400">
                  Step 01
                </p>

                <h3 className="mt-1 text-sm font-black text-slate-800">
                  Student Reports
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Student reports a maintenance issue.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                  👨‍💼
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-wide text-slate-400">
                  Step 02
                </p>

                <h3 className="mt-1 text-sm font-black text-slate-800">
                  Admin Assigns
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Admin forwards the complaint to you.
                </p>
              </div>

              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
                  🧑‍💼
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-wide text-indigo-500">
                  Your Role
                </p>

                <h3 className="mt-1 text-sm font-black text-slate-800">
                  Supervisor Assigns
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  You assign the suitable technician.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                  🔧
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-wide text-slate-400">
                  Step 04
                </p>

                <h3 className="mt-1 text-sm font-black text-slate-800">
                  Technician Resolves
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Technician completes and resolves the complaint.
                </p>
              </div>
            </div>
          </section>

          {/* ================= PRIVACY NOTICE ================= */}

          <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                🔒
              </div>

              <div>
                <h3 className="text-sm font-black text-blue-900">
                  Privacy & Access Control
                </h3>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Supervisor access is limited to maintenance
                  operations. Student personal information is not
                  displayed in the Supervisor Portal.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
