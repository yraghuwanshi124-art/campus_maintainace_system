
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SupervisorSidebar from "../components/SupervisorSidebar";

const SupervisorDashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

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
  // OPEN SINGLE COMPLAINT
  // =========================

  const openComplaint = (complaintId) => {
    if (!complaintId) return;

    navigate("/supervisor/complaints", {
      state: {
        complaintId,
      },
    });
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

  const highPriority = complaints.filter(
    (complaint) => complaint.priority === "High"
  ).length;

  // =========================
  // FILTERED COMPLAINTS
  // =========================

  const filteredComplaints = useMemo(() => {
    if (activeFilter === "All") {
      return complaints;
    }

    if (activeFilter === "Pending") {
      return complaints.filter(
        (complaint) =>
          complaint.status === "Pending" || !complaint.technician
      );
    }

    if (activeFilter === "Active") {
      return complaints.filter(
        (complaint) =>
          complaint.status === "Assigned" ||
          complaint.status === "In Progress"
      );
    }

    if (activeFilter === "Resolved") {
      return complaints.filter(
        (complaint) => complaint.status === "Resolved"
      );
    }

    if (activeFilter === "High") {
      return complaints.filter(
        (complaint) => complaint.priority === "High"
      );
    }

    return complaints;
  }, [complaints, activeFilter]);

  // =========================
  // HELPERS
  // =========================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Assigned":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "In Progress":
        return "bg-violet-50 text-violet-700 border-violet-200";

      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200";

      case "Medium":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "Low":
        return "bg-green-50 text-green-700 border-green-200";

      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
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

  const getFilterCount = (filter) => {
    if (filter === "All") return complaints.length;

    if (filter === "Pending") {
      return complaints.filter(
        (complaint) =>
          complaint.status === "Pending" || !complaint.technician
      ).length;
    }

    if (filter === "Active") {
      return complaints.filter(
        (complaint) =>
          complaint.status === "Assigned" ||
          complaint.status === "In Progress"
      ).length;
    }

    if (filter === "Resolved") {
      return complaints.filter(
        (complaint) => complaint.status === "Resolved"
      ).length;
    }

    if (filter === "High") {
      return complaints.filter(
        (complaint) => complaint.priority === "High"
      ).length;
    }

    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SupervisorSidebar onLogout={handleLogout} />

      <main className="min-h-screen transition-all duration-300 lg:ml-64">
        {/* ================= HEADER ================= */}

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur-md sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="pl-14 lg:pl-0">
              <p className="text-s font-bold text-slate-500">
                CampusFix
              </p>

              <p className="text-base font-black text-slate-800">
                Supervisor Dashboard
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/supervisor/notifications")
              }
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
              title="Notifications"
              aria-label="Notifications"
            >
              🔔
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
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
                  {/* {assignedBlocks.length */}
                    {/* // ? `${assignedBlocks.Supervisor Dashboard` */}
                    Supervisor Dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                  Manage maintenance complaints and coordinate
                  technicians across the campus.
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
            <button
              type="button"
              onClick={() => setActiveFilter("All")}
              className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
            >
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
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("Pending")}
              className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-md"
            >
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
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("Active")}
              className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-md"
            >
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
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("Resolved")}
              className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
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
            </button>
          </section>

          {/* ================= COMPLAINT SECTION ================= */}

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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
                        All maintenance complaints assigned to you.
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
                  Manage All →
                </button>
              </div>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {["All", "Pending", "Active", "High", "Resolved"].map(
                  (filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-black transition ${
                        activeFilter === filter
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                    >
                      {filter}

                      <span
                        className={`ml-2 rounded-md px-1.5 py-0.5 text-[10px] ${
                          activeFilter === filter
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {getFilterCount(filter)}
                      </span>
                    </button>
                  )
                )}
              </div>
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
                    Fetching assigned maintenance complaints.
                  </p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                    📋
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-700">
                    No complaints found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    There are no complaints matching the selected
                    filter.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredComplaints.map((complaint) => (
                    <article
                      key={complaint._id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                    >
                      {/* IMAGE */}

                      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                        {complaint.image ? (
                          <img
                            src={complaint.image}
                            alt="Complaint"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-4xl">
                            🧰
                          </div>
                        )}

                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-lg border bg-white/95 px-2.5 py-1 text-[10px] font-black shadow-sm ${getPriorityStyle(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority || "Normal"}
                          </span>

                          <span
                            className={`rounded-lg border bg-white/95 px-2.5 py-1 text-[10px] font-black shadow-sm ${getStatusStyle(
                              complaint.status
                            )}`}
                          >
                            {complaint.status}
                          </span>
                        </div>
                      </div>

                      {/* CARD BODY */}

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">
                            {complaint.category}
                          </span>

                          <span className="text-[13px] font-bold text-slate-400">
                            #{complaint._id?.slice(-6)}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-black text-slate-800">
                          {complaint.category} Complaint
                        </h3>

                        <p className="mt-1 text-s font-black text-indigo-700">
                          📍 {getLocationText(complaint)}
                        </p>

                        <p className="mt-3 line-clamp-3 min-h-[60px] text-s leading-5 text-slate-600">
                          {complaint.description ||
                            "No description provided."}
                        </p>

                        {/* TECHNICIAN */}

                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[12px] font-black uppercase tracking-wide text-slate-400">
                                Technician
                              </p>

                              <p className="mt-1 text-s font-black text-slate-700">
                                {complaint.technician?.name ||
                                  "Not assigned"}
                              </p>
                            </div>

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                              🛠️
                            </div>
                          </div>
                        </div>

                        {/* TIMELINE */}

                        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[13px] font-bold text-slate-400">
                              Created
                            </span>

                            <span className="text-right text-[12px] font-bold text-slate-600">
                              {formatDate(complaint.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[13px] font-bold text-slate-400">
                              Technician Assigned
                            </span>

                            <span className="text-right text-[12px] font-bold text-slate-600">
                              {formatDate(
                                complaint.technicianAssignedAt
                              )}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[13px] font-bold text-slate-400">
                              Resolved
                            </span>

                            <span className="text-right text-[12px] font-bold text-slate-600">
                              {formatDate(complaint.resolvedAt)}
                            </span>
                          </div>
                        </div>

                        {/* SINGLE COMPLAINT */}

                        <button
                          type="button"
                          onClick={() =>
                            openComplaint(complaint._id)
                          }
                          className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-indigo-700"
                        >
                          Manage Complaint →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {!loading &&
                filteredComplaints.length > 0 && (
                  <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-indigo-900">
                        {filteredComplaints.length} complaint
                        {filteredComplaints.length !== 1
                          ? "s"
                          : ""}{" "}
                        currently visible
                      </p>

                      <p className="mt-1 text-xs text-indigo-700">
                        Open Manage Complaints for full assignment
                        controls.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/supervisor/complaints")
                      }
                      className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-indigo-700"
                    >
                      Open Full Complaint Manager →
                    </button>
                  </div>
                )}
            </div>
          </section>

          {/* ================= QUICK ACTIONS ================= */}

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-slate-800">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage daily maintenance operations.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  View complaints and assign suitable technicians.
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
                  View and manage college technicians.
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
                  Open the notification center.
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
                  Admin forwards the complaint to the Supervisor.
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
                  Supervisor assigns the suitable technician.
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
