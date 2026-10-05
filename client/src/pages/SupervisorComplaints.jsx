
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import SupervisorSidebar from "../components/SupervisorSidebar";
import LogoutModal from "../components/LogoutModal";

function SupervisorComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);

  const [selectedTechnician, setSelectedTechnician] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showLogout, setShowLogout] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const assignedBlocks = user?.assignedBlocks || [];

  // =====================================================
  // FETCH COMPLAINTS
  // =====================================================

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        "/supervisor/complaints",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComplaints(
        response.data.complaints || []
      );
    } catch (error) {
      console.error(
        "FETCH SUPERVISOR COMPLAINTS ERROR:",
        error.response?.data || error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch complaints."
      );
    }
  };

  // =====================================================
  // FETCH TECHNICIANS
  // =====================================================

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        "/supervisor/technicians",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTechnicians(
        response.data.technicians || []
      );
    } catch (error) {
      console.error(
        "FETCH SUPERVISOR TECHNICIANS ERROR:",
        error.response?.data || error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch technicians."
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchComplaints(),
        fetchTechnicians(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // =====================================================
  // ASSIGN TECHNICIAN
  // =====================================================

  const handleAssignTechnician = async (
    complaintId
  ) => {
    const technicianId =
      selectedTechnician[complaintId];

    if (!technicianId) {
      setErrorMessage(
        "Please select a technician first."
      );
      return;
    }

    try {
      setAssigningId(complaintId);
      setMessage("");
      setErrorMessage("");

      const token = localStorage.getItem("token");

      const response = await api.patch(
        `/supervisor/complaints/${complaintId}/assign-technician`,
        {
          technicianId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Technician assigned successfully."
      );

      setSelectedTechnician((previous) => ({
        ...previous,
        [complaintId]: "",
      }));

      await fetchComplaints();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "ASSIGN TECHNICIAN ERROR:",
        error.response?.data || error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to assign technician."
      );

      setTimeout(() => {
        setErrorMessage("");
      }, 3500);
    } finally {
      setAssigningId(null);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

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
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200";

      case "Medium":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "Low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getTechniciansForBlock = (block) => {
    return technicians.filter((technician) =>
      technician.assignedBlocks?.includes(block)
    );
  };

  // =====================================================
  // FILTERS
  // =====================================================

  const filteredComplaints = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return complaints.filter((complaint) => {
      const matchesSearch =
        !search ||
        complaint.category
          ?.toLowerCase()
          .includes(search) ||
        complaint.block
          ?.toLowerCase()
          .includes(search) ||
        complaint.room
          ?.toLowerCase()
          .includes(search) ||
        complaint.floor
          ?.toLowerCase()
          .includes(search) ||
        complaint.description
          ?.toLowerCase()
          .includes(search) ||
        complaint.technician?.name
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        complaint.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        complaint.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    complaints,
    searchTerm,
    statusFilter,
    priorityFilter,
  ]);

  // =====================================================
  // STATS
  // =====================================================

  const totalComplaints =
    complaints.length;

  const pendingAssignment =
    complaints.filter(
      (complaint) =>
        !complaint.technician &&
        complaint.status !== "Resolved"
    ).length;

  const activeComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "Assigned" ||
        complaint.status === "In Progress"
    ).length;

  const resolvedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "Resolved"
    ).length;

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <SupervisorSidebar
        onLogout={() => setShowLogout(true)}
      />

      <div className="lg:ml-64">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="border-b border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-black tracking-wider text-indigo-600">
                  CAMPUSFIX
                </span>

                <span className="text-xs font-bold text-slate-400">
                  Supervisor Portal
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                Complaint Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review, manage and assign maintenance complaints.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                  Your Blocks
                </p>

                <p className="mt-1 text-sm font-black text-indigo-900">
                  {assignedBlocks.length
                    ? assignedBlocks.join(", ")
                    : "No block assigned"}
                </p>
              </div>

              <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:block">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Technicians
                </p>

                <p className="mt-1 text-sm font-black text-slate-800">
                  {technicians.length}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-7">
          {/* =================================================
              SUCCESS / ERROR
          ================================================= */}

          {message && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                ✓
              </div>

              <p className="text-sm font-black text-emerald-700">
                {message}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700">
                !
              </div>

              <p className="text-sm font-black text-red-700">
                {errorMessage}
              </p>
            </div>
          )}

          {/* =================================================
              STATS
          ================================================= */}

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Total
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-800">
                    {totalComplaints}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Assigned complaints
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  📋
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-amber-500">
                    Pending
                  </p>

                  <p className="mt-2 text-3xl font-black text-amber-700">
                    {pendingAssignment}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-amber-500">
                    Need technician
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                  ⏳
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-blue-500">
                    Active
                  </p>

                  <p className="mt-2 text-3xl font-black text-blue-700">
                    {activeComplaints}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-blue-500">
                    Work in progress
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                  🔧
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-500">
                    Resolved
                  </p>

                  <p className="mt-2 text-3xl font-black text-emerald-700">
                    {resolvedComplaints}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-emerald-500">
                    Completed work
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                  ✓
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              SEARCH / FILTER
          ================================================= */}

          {!loading && complaints.length > 0 && (
            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px]">
                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Search
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      🔎
                    </span>

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value)
                      }
                      placeholder="Search block, room, category, technician..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="All">
                      All Status
                    </option>
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="Assigned">
                      Assigned
                    </option>
                    <option value="In Progress">
                      In Progress
                    </option>
                    <option value="Resolved">
                      Resolved
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Priority
                  </label>

                  <select
                    value={priorityFilter}
                    onChange={(e) =>
                      setPriorityFilter(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="All">
                      All Priority
                    </option>
                    <option value="High">
                      High
                    </option>
                    <option value="Medium">
                      Medium
                    </option>
                    <option value="Low">
                      Low
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">
                  Showing{" "}
                  <span className="text-slate-700">
                    {filteredComplaints.length}
                  </span>{" "}
                  complaints
                </p>

                {(searchTerm ||
                  statusFilter !== "All" ||
                  priorityFilter !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("All");
                      setPriorityFilter("All");
                    }}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-800"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </section>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>

              <h2 className="mt-5 text-lg font-black text-slate-800">
                Loading Complaints
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Fetching complaints and technicians...
              </p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
                📋
              </div>

              <h2 className="mt-6 text-xl font-black text-slate-800">
                No complaints assigned
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Complaints assigned to you by Admin will appear
                here.
              </p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🔎
              </div>

              <h2 className="mt-5 text-lg font-black text-slate-800">
                No matching complaints
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            /* =================================================
               SEPARATE COMPLAINT CARDS
            ================================================= */

            <div className="space-y-7">
              {filteredComplaints.map(
                (complaint, index) => {
                  const blockTechnicians =
                    getTechniciansForBlock(
                      complaint.block
                    );

                  const isResolved =
                    complaint.status === "Resolved";

                  const currentTechnician =
                    complaint.technician?._id || "";

                  const selectedValue =
                    selectedTechnician[
                      complaint._id
                    ] || currentTechnician;

                  return (
                    <article
                      key={complaint._id}
                      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-indigo-200 hover:shadow-lg"
                    >
                      {/* =================================================
                          COMPLAINT TITLE BAR
                      ================================================= */}

                      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-white px-5 py-5 sm:px-7">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-sm">
                              #{index + 1}
                            </div>

                            <div>
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-black text-indigo-700">
                                  {complaint.category}
                                </span>

                                <span
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-black ${getPriorityStyle(
                                    complaint.priority
                                  )}`}
                                >
                                  {complaint.priority} Priority
                                </span>

                                <span
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-black ${getStatusStyle(
                                    complaint.status
                                  )}`}
                                >
                                  {complaint.status}
                                </span>
                              </div>

                              <h2 className="mt-2 text-lg font-black text-slate-800">
                                {complaint.category} Maintenance
                                Complaint
                              </h2>
                            </div>
                          </div>

                          {/* LOCATION */}

                          <div className="rounded-2xl border border-indigo-100 bg-white px-5 py-4 shadow-sm lg:min-w-[260px]">
                            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                              Complaint Location
                            </p>

                            <p className="mt-1 text-base font-black text-slate-800">
                              📍 {complaint.block}
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-500">
                              {complaint.floor
                                ? `Floor ${complaint.floor} • `
                                : ""}
                              Room {complaint.room}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* =================================================
                          MAIN COMPLAINT CONTENT
                      ================================================= */}

                      <div className="p-5 sm:p-7">
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
                          {/* LEFT */}

                          <div className="min-w-0">
                            {/* DESCRIPTION + PHOTO */}

                            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                  Issue Description
                                </p>

                                <div className="mt-2 min-h-[130px] rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                  <p className="text-sm leading-7 text-slate-700">
                                    {complaint.description}
                                  </p>
                                </div>
                              </div>

                              {/* PHOTO */}

                              <div>
                                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                  Complaint Photo
                                </p>

                                {complaint.image ? (
                                  <div className="mt-2 h-[130px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                    <img
                                      src={
                                        complaint.image
                                      }
                                      alt="Complaint evidence"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="mt-2 flex h-[130px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-3xl">
                                    🧰
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* BASIC DETAILS */}

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  Block
                                </p>

                                <p className="mt-1 text-sm font-black text-slate-800">
                                  {complaint.block}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  Floor
                                </p>

                                <p className="mt-1 text-sm font-black text-slate-800">
                                  {complaint.floor ||
                                    "Not specified"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  Room
                                </p>

                                <p className="mt-1 text-sm font-black text-slate-800">
                                  {complaint.room}
                                </p>
                              </div>
                            </div>

                            {/* CURRENT TECHNICIAN */}

                            {complaint.technician && (
                              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                                      🧑‍🔧
                                    </div>

                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                        Assigned Technician
                                      </p>

                                      <p className="mt-1 font-black text-emerald-900">
                                        {
                                          complaint
                                            .technician
                                            .name
                                        }
                                      </p>

                                      <p className="text-xs font-semibold text-emerald-700">
                                        {
                                          complaint
                                            .technician
                                            .specialization
                                        }
                                      </p>
                                    </div>
                                  </div>

                                  <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-black text-emerald-700">
                                    Technician Assigned ✓
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* TIMELINE */}

                            <div className="mt-6">
                              <div className="mb-3 flex items-center justify-between">
                                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                  Activity Timeline
                                </p>

                                <span className="text-[10px] font-bold text-slate-400">
                                  Complaint History
                                </span>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <div className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm">
                                      📝
                                    </span>

                                    <div>
                                      <p className="text-xs font-black text-slate-700">
                                        Complaint Created
                                      </p>

                                      <p className="mt-1 text-[11px] text-slate-500">
                                        {formatDate(
                                          complaint.createdAt
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <div className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm">
                                      👨‍💼
                                    </span>

                                    <div>
                                      <p className="text-xs font-black text-slate-700">
                                        Assigned by Admin
                                      </p>

                                      <p className="mt-1 text-[11px] text-slate-500">
                                        {formatDate(
                                          complaint.assignedAt
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <div className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-sm">
                                      🔧
                                    </span>

                                    <div>
                                      <p className="text-xs font-black text-slate-700">
                                        Technician Assigned
                                      </p>

                                      <p className="mt-1 text-[11px] text-slate-500">
                                        {formatDate(
                                          complaint.technicianAssignedAt
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <div className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm">
                                      ✓
                                    </span>

                                    <div>
                                      <p className="text-xs font-black text-slate-700">
                                        Resolved
                                      </p>

                                      <p className="mt-1 text-[11px] text-slate-500">
                                        {formatDate(
                                          complaint.resolvedAt
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* =================================================
                              RIGHT ASSIGNMENT PANEL
                          ================================================= */}

                          <aside className="h-fit rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg text-white">
                                👨‍🔧
                              </div>

                              <div>
                                <h3 className="text-sm font-black text-slate-800">
                                  Assign Technician
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                  {complaint.block} technicians
                                </p>
                              </div>
                            </div>

                            {/* AVAILABLE */}

                            <div className="mt-5 rounded-2xl border border-indigo-100 bg-white p-4">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  Available
                                </p>

                                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-600">
                                  {
                                    blockTechnicians.length
                                  }
                                </span>
                              </div>

                              {blockTechnicians.length >
                              0 ? (
                                <div className="mt-3 space-y-2">
                                  {blockTechnicians.map(
                                    (technician) => (
                                      <div
                                        key={
                                          technician._id
                                        }
                                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                                      >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                                          🔧
                                        </div>

                                        <div className="min-w-0">
                                          <p className="truncate text-xs font-black text-slate-800">
                                            {
                                              technician.name
                                            }
                                          </p>

                                          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">
                                            {
                                              technician.specialization
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="mt-3 rounded-xl bg-red-50 p-3">
                                  <p className="text-xs font-bold leading-5 text-red-600">
                                    No technician is assigned
                                    to this block.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* SELECT */}

                            <div className="mt-5">
                              <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Select Technician
                              </label>

                              <select
                                value={selectedValue}
                                onChange={(e) =>
                                  setSelectedTechnician(
                                    (previous) => ({
                                      ...previous,
                                      [complaint._id]:
                                        e.target.value,
                                    })
                                  )
                                }
                                disabled={
                                  isResolved ||
                                  assigningId ===
                                    complaint._id
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                              >
                                <option value="">
                                  Select technician
                                </option>

                                {blockTechnicians.map(
                                  (technician) => (
                                    <option
                                      key={
                                        technician._id
                                      }
                                      value={
                                        technician._id
                                      }
                                    >
                                      {technician.name} —{" "}
                                      {
                                        technician.specialization
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            {/* BUTTON */}

                            <button
                              type="button"
                              onClick={() =>
                                handleAssignTechnician(
                                  complaint._id
                                )
                              }
                              disabled={
                                isResolved ||
                                assigningId ===
                                  complaint._id ||
                                blockTechnicians.length ===
                                  0 ||
                                !selectedValue
                              }
                              className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {assigningId ===
                              complaint._id
                                ? "Assigning..."
                                : isResolved
                                ? "✓ Resolved"
                                : complaint.technician
                                ? "↻ Reassign Technician"
                                : "Assign Technician →"}
                            </button>

                            {/* RULE */}

                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                              <div className="flex gap-2">
                                <span className="text-sm">
                                  🔒
                                </span>

                                <p className="text-[10px] font-semibold leading-5 text-slate-500">
                                  Only technicians assigned to{" "}
                                  <span className="font-black text-slate-700">
                                    {complaint.block}
                                  </span>{" "}
                                  can be selected.
                                </p>
                              </div>
                            </div>
                          </aside>
                        </div>
                      </div>

                      {/* =================================================
                          FOOTER
                      ================================================= */}

                      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                        <p className="text-[11px] font-semibold text-slate-400">
                          Complaint ID:{" "}
                          <span className="font-bold text-slate-600">
                            {complaint._id}
                          </span>
                        </p>

                        <p className="text-[11px] font-semibold text-slate-400">
                          Last updated through CampusFix workflow
                        </p>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </main>
      </div>

      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
      />
    </div>
  );
}

export default SupervisorComplaints;
