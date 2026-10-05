
import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutModal from "../components/LogoutModal";
import AdminSidebar from "../components/AdminSidebar";

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState({});
  const [showLogout, setShowLogout] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Recent 3 / All complaints
  const [showAllComplaints, setShowAllComplaints] = useState(false);

  // Read More / Show Less
  const [expandedComplaints, setExpandedComplaints] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= TOGGLE COMPLAINT =================

  const toggleComplaint = (complaintId) => {
    setExpandedComplaints((prev) => ({
      ...prev,
      [complaintId]: !prev[complaintId],
    }));
  };

  // ================= FETCH COMPLAINTS =================

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/complaints/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "ADMIN COMPLAINT DATA:",
        response.data.complaints
      );

      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.log("Failed to fetch complaints:", error);
    }
  };

  // ================= FETCH SUPERVISORS =================

  const fetchSupervisors = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/supervisor/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "ADMIN SUPERVISOR DATA:",
        response.data.supervisors
      );

      setSupervisors(response.data.supervisors || []);
    } catch (error) {
      console.log(
        "Failed to fetch supervisors:",
        error.response?.data || error.message
      );
    }
  };

  // ================= INITIAL LOAD =================

  useEffect(() => {
    fetchComplaints();
    fetchSupervisors();
  }, []);

  // ================= ASSIGN COMPLAINT TO SUPERVISOR =================

  const assignComplaint = async (complaintId, supervisorId) => {
    if (!supervisorId) {
      alert("Please select a supervisor first.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await api.patch(
        `/complaints/${complaintId}/assign`,
        {
          supervisorId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      const selectedSupervisor = supervisors.find(
        (supervisor) => supervisor._id === supervisorId
      );

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                supervisor:
                  selectedSupervisor ||
                  response.data.complaint?.supervisor ||
                  supervisorId,
                technician: null,
                status: "Assigned",
                assignedAt:
                  response.data.complaint?.assignedAt ||
                  new Date().toISOString(),
              }
            : complaint
        )
      );

      setSelectedSupervisors((prev) => {
        const updated = { ...prev };
        delete updated[complaintId];
        return updated;
      });
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to assign complaint"
      );
    }
  };

  // ================= DELETE COMPLAINT =================

  const deleteComplaint = async (complaintId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this complaint?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(
        `/complaints/${complaintId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      setComplaints((prevComplaints) =>
        prevComplaints.filter(
          (complaint) => complaint._id !== complaintId
        )
      );

      setSelectedSupervisors((prev) => {
        const updated = { ...prev };
        delete updated[complaintId];
        return updated;
      });

      setExpandedComplaints((prev) => {
        const updated = { ...prev };
        delete updated[complaintId];
        return updated;
      });
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete complaint"
      );
    }
  };

  // ================= STATUS STYLE =================

  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    }

    if (status === "In Progress") {
      return "border-purple-100 bg-purple-50 text-purple-700";
    }

    if (status === "Assigned") {
      return "border-orange-100 bg-orange-50 text-orange-700";
    }

    return "border-blue-100 bg-blue-50 text-blue-700";
  };

  // ================= PRIORITY STYLE =================

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "border-red-100 bg-red-50 text-red-600";
    }

    if (priority === "Medium") {
      return "border-orange-100 bg-orange-50 text-orange-600";
    }

    return "border-emerald-100 bg-emerald-50 text-emerald-600";
  };

  // ================= FORMAT DATE =================

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ================= GET SUPERVISOR NAME =================

  const getSupervisorName = (complaint) => {
    if (complaint.supervisor?.name) {
      return complaint.supervisor.name;
    }

    if (typeof complaint.supervisor === "string") {
      const supervisor = supervisors.find(
        (item) => item._id === complaint.supervisor
      );

      return supervisor?.name || "Assigned Supervisor";
    }

    return "Not assigned";
  };

  // ================= STATISTICS =================

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (complaint) => complaint.status === "Pending"
  ).length;

  const assignedComplaints = complaints.filter(
    (complaint) => complaint.status === "Assigned"
  ).length;

  const inProgressComplaints = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  // ================= FILTERED COMPLAINTS =================

  const filteredComplaints = complaints.filter((complaint) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      complaint.category
        ?.toLowerCase()
        .includes(search) ||
      complaint.block
        ?.toLowerCase()
        .includes(search) ||
      complaint.room
        ?.toLowerCase()
        .includes(search) ||
      complaint.description
        ?.toLowerCase()
        .includes(search) ||
      complaint.user?.name
        ?.toLowerCase()
        .includes(search) ||
      complaint.user?.email
        ?.toLowerCase()
        .includes(search) ||
      complaint.user?.classSection
        ?.toLowerCase()
        .includes(search) ||
      complaint.user?.enrollmentNumber
        ?.toLowerCase()
        .includes(search) ||
      complaint.user?.department
        ?.toLowerCase()
        .includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ================= SORT BY RECENT =================

  const sortedComplaints = [...filteredComplaints].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  // ================= SHOW 3 OR ALL =================

  const displayedComplaints =
    showAllComplaints ||
    searchTerm.trim() ||
    statusFilter !== "All"
      ? sortedComplaints
      : sortedComplaints.slice(0, 3);

  const pendingComplaintList = displayedComplaints.filter(
    (complaint) => complaint.status === "Pending"
  );

  const activeComplaints = displayedComplaints.filter(
    (complaint) =>
      complaint.status === "Assigned" ||
      complaint.status === "In Progress"
  );

  const resolvedComplaintList = displayedComplaints.filter(
    (complaint) => complaint.status === "Resolved"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar
        onLogout={() => setShowLogout(true)}
      />

      <div className="lg:ml-64">
        {/* ================= NAVBAR ================= */}

        <nav className="border-b border-indigo-100 bg-indigo-50 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-5">
              <div className="rounded-xl bg-white px-3 py-1.5 shadow-sm">
                <img
                  src="https://www.medicaps.ac.in/public/frontend/images/medicaps-logo-fin.webp"
                  alt="Medi-Caps University"
                  className="h-11 w-auto object-contain"
                />
              </div>

              <div className="hidden border-l-2 border-indigo-200 pl-5 sm:block">
                <p className="text-xl font-extrabold tracking-tight text-indigo-700">
                  CampusFix
                </p>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  Campus Maintenance Management System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-base font-bold text-slate-800">
                  {user?.assignedBlocks?.length
                    ? `${user.assignedBlocks.join(", ")} Admin`
                    : "Administrator"}
                </p>

                <p className="mt-0.5 max-w-[230px] truncate text-sm text-slate-500">
                  {user?.email || "No email"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-base font-bold text-white shadow-sm">
                A
              </div>

              <button
                onClick={() => setShowLogout(true)}
                className="rounded-xl border border-indigo-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* ================= MAIN ================= */}

        <main className="mx-auto max-w-7xl px-6 py-10">
          {/* ================= HERO ================= */}

          <div className="relative mb-10 overflow-hidden rounded-3xl bg-indigo-600 p-8 shadow-lg sm:p-10">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

            <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/5" />

            <div className="relative z-10 max-w-3xl text-white">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
                Medi-Caps University • Administration
              </p>

              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                {user?.assignedBlocks?.length
                  ? `${user.assignedBlocks.join(", ")} Admin Dashboard`
                  : "Admin Control Center 👨‍💼"}
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-indigo-100">
                Monitor campus maintenance requests, manage complaints,
                assign supervisors and track resolution progress from one
                centralized dashboard.
              </p>
            </div>
          </div>

          {/* ================= STATISTICS ================= */}

          <div className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-800">
                Maintenance Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Real-time summary of campus maintenance complaints.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* TOTAL */}

              <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    Total
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    📊
                  </div>
                </div>

                <p className="mt-4 text-3xl font-extrabold text-slate-800">
                  {totalComplaints}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  All complaints
                </p>
              </div>

              {/* PENDING */}

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    Pending
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    ⏳
                  </div>
                </div>

                <p className="mt-4 text-3xl font-extrabold text-blue-600">
                  {pendingComplaints}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Awaiting assignment
                </p>
              </div>

              {/* ASSIGNED */}

              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    Assigned
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-xl">
                    👨‍💼
                  </div>
                </div>

                <p className="mt-4 text-3xl font-extrabold text-orange-600">
                  {assignedComplaints}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Supervisor assigned
                </p>
              </div>

              {/* IN PROGRESS */}

              <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    In Progress
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-xl">
                    🔧
                  </div>
                </div>

                <p className="mt-4 text-3xl font-extrabold text-purple-600">
                  {inProgressComplaints}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Currently being fixed
                </p>
              </div>

              {/* RESOLVED */}

              <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    Resolved
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                    ✅
                  </div>
                </div>

                <p className="mt-4 text-3xl font-extrabold text-emerald-600">
                  {resolvedComplaints}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Successfully completed
                </p>
              </div>
            </div>
          </div>

          {/* ================= ALL / RECENT COMPLAINTS HEADER ================= */}

          <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-700 p-6 sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-white">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                    🛠️ Maintenance Management
                  </div>

                  <h2 className="text-2xl font-extrabold sm:text-3xl">
                    {showAllComplaints ||
                    searchTerm.trim() ||
                    statusFilter !== "All"
                      ? "All Complaints"
                      : "Recent Complaints"}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
                    {showAllComplaints ||
                    searchTerm.trim() ||
                    statusFilter !== "All"
                      ? "Manage and monitor every campus maintenance complaint."
                      : "Latest maintenance complaints reported on campus."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl">
                      📋
                    </div>

                    <div>
                      <p className="text-2xl font-extrabold text-white">
                        {displayedComplaints.length}
                      </p>

                      <p className="text-xs font-medium text-indigo-100">
                        Showing complaints
                      </p>
                    </div>
                  </div>

                  {!searchTerm.trim() &&
                    statusFilter === "All" && (
                      <button
                        onClick={() =>
                          setShowAllComplaints(
                            !showAllComplaints
                          )
                        }
                        className="rounded-2xl border border-white/30 bg-white px-5 py-3.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                      >
                        {showAllComplaints
                          ? "← Show Recent"
                          : "View All →"}
                      </button>
                    )}
                </div>
              </div>
            </div>

            {/* SEARCH + FILTER */}

            <div className="border-b border-slate-100 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-xl">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🔍
                  </span>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    placeholder="Search by complaint, student, block, room..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "All", icon: "📋" },
                    { name: "Pending", icon: "⏳" },
                    { name: "Assigned", icon: "👨‍💼" },
                    { name: "In Progress", icon: "🔧" },
                    { name: "Resolved", icon: "✅" },
                  ].map((filter) => (
                    <button
                      key={filter.name}
                      onClick={() =>
                        setStatusFilter(filter.name)
                      }
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                        statusFilter === filter.name
                          ? "bg-indigo-600 text-white shadow-md"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      {filter.icon} {filter.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ================= NO COMPLAINTS ================= */}

          {displayedComplaints.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-4xl">
                {searchTerm || statusFilter !== "All"
                  ? "🔎"
                  : "📋"}
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-800">
                {searchTerm || statusFilter !== "All"
                  ? "No matching complaints"
                  : "No complaints found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {searchTerm || statusFilter !== "All"
                  ? "Try changing your search or status filter to find other complaints."
                  : "There are currently no maintenance complaints in the system."}
              </p>

              {(searchTerm ||
                statusFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                  }}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* ================= PENDING ================= */}

              {pendingComplaintList.length > 0 && (
                <div className="mb-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-800">
                        🟡 Pending Complaints
                      </h2>

                      <p className="text-sm text-slate-500">
                        Complaints waiting for supervisor assignment
                      </p>
                    </div>

                    <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
                      {pendingComplaintList.length}
                    </span>
                  </div>
                </div>
              )}

              {/* ================= ACTIVE ================= */}

              {activeComplaints.length > 0 && (
                <div className="mb-4 mt-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800">
                      🔵 Active Complaints
                    </h2>

                    <p className="text-sm text-slate-500">
                      Assigned and currently in-progress complaints
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                    {activeComplaints.length}
                  </span>
                </div>
              )}

              {/* ================= RESOLVED ================= */}

              {resolvedComplaintList.length > 0 && (
                <div className="mb-4 mt-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800">
                      🟢 Resolved Complaints
                    </h2>

                    <p className="text-sm text-slate-500">
                      Complaints successfully resolved by technicians
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                    {resolvedComplaintList.length}
                  </span>
                </div>
              )}

              {/* ================= COMPLAINT CARDS ================= */}

              {displayedComplaints.map((complaint) => {
                const isExpanded =
                  expandedComplaints[complaint._id];

                return (
                  <div
                    key={complaint._id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                  >
                    {/* TOP STATUS LINE */}

                    <div
                      className={`h-1.5 ${
                        complaint.status === "Resolved"
                          ? "bg-emerald-500"
                          : complaint.status === "In Progress"
                          ? "bg-purple-500"
                          : complaint.status === "Assigned"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    />

                    {/* CARD CONTENT */}

                    <div className="p-5 sm:p-6">
                      {/* HEADER */}

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                              complaint.status === "Resolved"
                                ? "bg-emerald-50"
                                : complaint.status === "In Progress"
                                ? "bg-purple-50"
                                : complaint.status === "Assigned"
                                ? "bg-orange-50"
                                : "bg-indigo-50"
                            }`}
                          >
                            🛠️
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
                                Maintenance Request
                              </span>

                              <span className="text-xs text-slate-400">
                                • #{complaint._id?.slice(-6)}
                              </span>
                            </div>

                            <h3 className="mt-1 text-xl font-extrabold text-slate-800">
                              {complaint.category}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              Reported by{" "}
                              <span className="font-semibold text-slate-700">
                                {complaint.user?.name ||
                                  "Unknown Student"}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* STATUS + PRIORITY */}

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3.5 py-2 text-xs font-bold ${getStatusStyle(
                              complaint.status
                            )}`}
                          >
                            {complaint.status === "Resolved" &&
                              "✓ "}

                            {complaint.status === "In Progress" &&
                              "⚙ "}

                            {complaint.status === "Assigned" &&
                              "👨‍💼 "}

                            {complaint.status === "Pending" &&
                              "⏳ "}

                            {complaint.status}
                          </span>

                          <span
                            className={`rounded-full border px-3.5 py-2 text-xs font-bold ${getPriorityStyle(
                              complaint.priority
                            )}`}
                          >
                            ⚡ {complaint.priority}
                          </span>
                        </div>
                      </div>

                      {/* ================= EXPANDED DETAILS ================= */}

                      {isExpanded && (
                        <>
                          {/* INFO GRID */}

                          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {/* LOCATION */}

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition group-hover:bg-indigo-50/40">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                <span className="text-base">
                                  📍
                                </span>
                                Location
                              </div>

                              <p className="mt-2 text-xl font-bold text-slate-700">
                                {complaint.block}
                              </p>

                              <p className="mt-0.5 font-semibold text-slate-500">
                                Room {complaint.room}
                              </p>
                            </div>

                            {/* STUDENT */}

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition group-hover:bg-indigo-50/40">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                <span className="text-base">
                                  👨‍🎓
                                </span>
                                Student
                              </div>

                              <p className="mt-2 truncate font-bold text-slate-700">
                                {complaint.user?.name ||
                                  "Unknown Student"}
                              </p>

                              <p className="mt-1 truncate text-sm font-bold text-indigo-600">
                                🎓{" "}
                                {complaint.user
                                  ?.enrollmentNumber ||
                                  "No enrollment number"}
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                                {complaint.user?.email ||
                                  "No email"}
                              </p>

                              {complaint.mobileNumber && (
                                <p className="mt-1 truncate text-sm font-bold text-emerald-600">
                                  📞 {complaint.mobileNumber}
                                </p>
                              )}

                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                {complaint.user?.department ||
                                  "No department"}
                                {" • "}
                                {complaint.user?.semester
                                  ? `Semester ${complaint.user.semester}`
                                  : "No semester"}
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-600">
                                🏫{" "}
                                {complaint.user?.classSection ||
                                  "No class"}
                              </p>
                            </div>

                            {/* SUPERVISOR */}

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition group-hover:bg-indigo-50/40">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                <span className="text-base">
                                  👨‍💼
                                </span>
                                Supervisor
                              </div>

                              <p className="mt-2 truncate font-bold text-slate-700">
                                {getSupervisorName(complaint)}
                              </p>

                              <p className="mt-0.5 font-semibold text-slate-500">
                                {complaint.status === "Resolved"
                                  ? "Work completed"
                                  : complaint.supervisor
                                  ? "Currently responsible"
                                  : "Waiting for assignment"}
                              </p>
                            </div>

                            {/* PRIORITY */}

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition group-hover:bg-indigo-50/40">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                <span className="text-base">
                                  ⚡
                                </span>
                                Priority
                              </div>

                              <p
                                className={`mt-2 font-extrabold ${getPriorityStyle(
                                  complaint.priority
                                )
                                  .replace(
                                    "border-red-100 bg-red-50 ",
                                    ""
                                  )
                                  .replace(
                                    "border-orange-100 bg-orange-50 ",
                                    ""
                                  )
                                  .replace(
                                    "border-emerald-100 bg-emerald-50 ",
                                    ""
                                  )}`}
                              >
                                {complaint.priority}
                              </p>

                              <p className="mt-0.5 font-semibold text-slate-500">
                                Maintenance priority
                              </p>
                            </div>
                          </div>

                          {/* DESCRIPTION */}

                          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-base">
                                📝
                              </span>

                              <p className="text-lg font-bold uppercase tracking-wide text-slate-700">
                                Problem Description
                              </p>
                            </div>

                            <p className="text-lg font-semibold leading-7 text-slate-600">
                              {complaint.description}
                            </p>
                          </div>

                          {/* TIMELINE */}

                          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                            <div className="mb-5 flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                                🕒
                              </div>

                              <div>
                                <p className="font-bold text-slate-800">
                                  Complaint Timeline
                                </p>

                                <p className="text-xs text-slate-500">
                                  Complete history of this maintenance request
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                              {/* RAISED */}

                              <div className="rounded-xl bg-white p-3 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600">
                                    ✓
                                  </div>

                                  <p className="text-sm font-bold text-slate-800">
                                    Complaint Raised
                                  </p>
                                </div>

                                <p className="mt-2 text-xs text-slate-500">
                                  By{" "}
                                  {complaint.user?.name ||
                                    "Student"}
                                </p>

                                <p className="mt-1 text-xs font-semibold text-blue-600">
                                  🕒{" "}
                                  {formatDateTime(
                                    complaint.createdAt
                                  )}
                                </p>
                              </div>

                              {/* SUPERVISOR ASSIGNMENT */}

                              <div className="rounded-xl bg-white p-3 shadow-sm">
                                {complaint.assignedAt ? (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm text-orange-600">
                                        ✓
                                      </div>

                                      <p className="text-sm font-bold text-slate-800">
                                        Supervisor Assigned
                                      </p>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-500">
                                      Assigned to{" "}
                                      <span className="font-bold text-orange-600">
                                        {getSupervisorName(
                                          complaint
                                        )}
                                      </span>
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-orange-600">
                                      🕒{" "}
                                      {formatDateTime(
                                        complaint.assignedAt
                                      )}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-400">
                                        2
                                      </div>

                                      <p className="text-sm font-bold text-slate-400">
                                        Supervisor Assignment
                                      </p>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-400">
                                      Waiting for supervisor assignment.
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                      Pending
                                    </p>
                                  </>
                                )}
                              </div>

                              {/* RESOLUTION */}

                              <div className="rounded-xl bg-white p-3 shadow-sm">
                                {complaint.resolvedAt ? (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">
                                        ✓
                                      </div>

                                      <p className="text-sm font-bold text-slate-800">
                                        Complaint Resolved
                                      </p>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-500">
                                      Maintenance issue successfully resolved.
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-emerald-600">
                                      🕒{" "}
                                      {formatDateTime(
                                        complaint.resolvedAt
                                      )}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-400">
                                        3
                                      </div>

                                      <p className="text-sm font-bold text-slate-400">
                                        Resolution
                                      </p>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-400">
                                      Waiting for the issue to be resolved.
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                      Pending
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* PHOTOS */}

                          {(complaint.image ||
                            complaint.completionImage) && (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              {complaint.image && (
                                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                  <div className="mb-3 flex items-center gap-2">
                                    <span>📷</span>

                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                      Problem Photo
                                    </p>
                                  </div>

                                  <img
                                    src={complaint.image}
                                    alt="Reported problem"
                                    className="h-56 w-full rounded-xl object-cover transition duration-300 group-hover:scale-[1.01]"
                                  />
                                </div>
                              )}

                              {complaint.completionImage && (
                                <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                  <div className="mb-3 flex items-center gap-2">
                                    <span>✅</span>

                                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                                      Completion Proof
                                    </p>
                                  </div>

                                  <img
                                    src={
                                      complaint.completionImage
                                    }
                                    alt="Completed maintenance work"
                                    className="h-56 w-full rounded-xl object-cover"
                                  />

                                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                                    ✓ Technician uploaded completion proof
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ================= STUDENT FEEDBACK ================= */}

                          {complaint.status === "Resolved" && (
                            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
                              <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg">
                                  ⭐
                                </div>

                                <div>
                                  <p className="font-bold text-slate-800">
                                    Student Feedback
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    Feedback provided after complaint resolution
                                  </p>
                                </div>
                              </div>

                              {complaint.feedbackRating ? (
                                <div className="rounded-xl border border-amber-100 bg-white p-4">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <div className="text-2xl tracking-wide">
                                      {"★".repeat(
                                        complaint.feedbackRating
                                      )}
                                      {"☆".repeat(
                                        5 -
                                          complaint.feedbackRating
                                      )}
                                    </div>

                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                      {complaint.feedbackRating}/5
                                    </span>
                                  </div>

                                  {complaint.feedbackComment && (
                                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Student Comment
                                      </p>

                                      <p className="mt-2 text-sm leading-6 text-slate-600">
                                        "{complaint.feedbackComment}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4">
                                  <p className="text-sm font-semibold text-slate-500">
                                    No feedback submitted yet.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* ================= READ MORE / SHOW LESS ================= */}

                    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                      <button
                        type="button"
                        onClick={() =>
                          toggleComplaint(complaint._id)
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-5 py-3 text-sm font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50 hover:shadow-md"
                      >
                        {isExpanded
                          ? "Show Less"
                          : "Read More"}

                        <span className="text-base">
                          {isExpanded ? "↑" : "↓"}
                        </span>
                      </button>
                    </div>

                    {/* ================= ACTION BAR ================= */}

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                          {/* ASSIGN SUPERVISOR */}

                          {complaint.status !== "Resolved" ? (
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                                  👨‍💼
                                </div>

                                <p className="text-sm font-bold text-slate-700">
                                  Supervisor Assignment
                                </p>
                              </div>

                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <select
                                  value={
                                    selectedSupervisors[
                                      complaint._id
                                    ] ||
                                    complaint.supervisor?._id ||
                                    complaint.supervisor ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    setSelectedSupervisors(
                                      (prev) => ({
                                        ...prev,
                                        [complaint._id]:
                                          e.target.value,
                                      })
                                    )
                                  }
                                  className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                >
                                  <option value="">
                                    Select supervisor
                                  </option>

                                  {supervisors.map(
                                    (supervisor) => (
                                      <option
                                        key={supervisor._id}
                                        value={supervisor._id}
                                      >
                                        {supervisor.name} —{" "}
                                        {supervisor.assignedBlocks?.join(
                                          ", "
                                        )}
                                      </option>
                                    )
                                  )}
                                </select>

                                <button
                                  onClick={() => {
                                    const supervisorId =
                                      selectedSupervisors[
                                        complaint._id
                                      ] ||
                                      complaint.supervisor?._id ||
                                      complaint.supervisor;

                                    assignComplaint(
                                      complaint._id,
                                      supervisorId
                                    );
                                  }}
                                  disabled={
                                    !selectedSupervisors[
                                      complaint._id
                                    ] &&
                                    !complaint.supervisor
                                  }
                                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                  👨‍💼 Assign Supervisor
                                </button>
                              </div>

                              <p className="mt-2 text-xs font-semibold text-slate-500">
                                Supervisor responsible for:{" "}
                                <span className="text-indigo-600">
                                  {complaint.block}
                                </span>
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                                ✅
                              </div>

                              <div>
                                <p className="font-bold text-emerald-800">
                                  Work Completed
                                </p>

                                <p className="text-xs text-emerald-600">
                                  Complaint successfully resolved by technician.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* DELETE */}

                          <button
                            onClick={() =>
                              deleteComplaint(
                                complaint._id
                              )
                            }
                            className="rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 hover:shadow-lg active:scale-[0.98]"
                          >
                            🗑️ Delete Complaint
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* ================= ADMIN TIP ================= */}

        <section className="mx-auto max-w-7xl px-6 pb-10">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
            <div className="flex gap-4">
              <div className="text-2xl">💡</div>

              <div>
                <h3 className="font-bold text-indigo-900">
                  Admin Tip
                </h3>

                <p className="mt-2 text-sm leading-6 text-indigo-700">
                  Assign pending complaints to the appropriate
                  supervisor as soon as possible. The supervisor
                  will coordinate with the suitable technician for
                  maintenance and resolution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}

        <footer className="mt-6 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <p className="text-lg font-bold text-slate-800">
                  CampusFix
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Medi-Caps University
                </p>
              </div>

              <div className="text-sm text-slate-500">
                <p>
                  Smart Campus • Faster Resolution • Better Management
                </p>

                <p className="mt-1">
                  © 2026 Medi-Caps University
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* ================= LOGOUT MODAL ================= */}

        <LogoutModal
          isOpen={showLogout}
          onClose={() => setShowLogout(false)}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
