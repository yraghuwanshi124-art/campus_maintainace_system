
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import LogoutModal from "../components/LogoutModal";

function TechnicianDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [showLogout, setShowLogout] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [expandedComplaints, setExpandedComplaints] = useState({});
  const [showAllComplaints, setShowAllComplaints] = useState(false);

  const [uploadingId, setUploadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const technicianName = user?.name || "Technician";
  const specialization = user?.specialization || "Maintenance Team";

  // =========================================================
  // FETCH COMPLAINTS
  // =========================================================

  const fetchComplaints = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem("token");

      const response = await api.get("/complaints/assigned", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDateTime = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // TOGGLE COMPLAINT
  // =========================================================

  const toggleComplaint = (complaintId) => {
    setExpandedComplaints((prev) => ({
      ...prev,
      [complaintId]: !prev[complaintId],
    }));
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "In Progress":
        return "bg-violet-50 text-violet-700 border-violet-200";

      case "Assigned":
        return "bg-amber-50 text-amber-700 border-amber-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // =========================================================
  // PRIORITY STYLE
  // =========================================================

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

  // =========================================================
  // STATUS PROGRESS
  // =========================================================

  const getProgress = (status) => {
    if (status === "Resolved") return 100;
    if (status === "In Progress") return 66;
    if (status === "Assigned") return 33;
    return 0;
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (complaintId, status) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.patch(
        `/complaints/${complaintId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                status,
                resolvedAt:
                  status === "Resolved"
                    ? response.data.complaint?.resolvedAt ||
                      new Date().toISOString()
                    : complaint.resolvedAt,
              }
            : complaint
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update complaint status"
      );
    }
  };

  // =========================================================
  // COMPLETION PHOTO
  // =========================================================

  const handleCompletionPhoto = async (complaintId, file) => {
    if (!file) return;

    try {
      setUploadingId(complaintId);

      const token = localStorage.getItem("token");

      const uploadData = new FormData();

      uploadData.append("file", file);
      uploadData.append("upload_preset", "campusfix_upload");

      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/m7gxszmr/image/upload",
        {
          method: "POST",
          body: uploadData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        throw new Error("Image upload failed");
      }

      const imageUrl = cloudinaryData.secure_url;

      const response = await api.patch(
        `/complaints/${complaintId}/completion-photo`,
        {
          completionImage: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                completionImage: imageUrl,
              }
            : complaint
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload completion photo"
      );
    } finally {
      setUploadingId(null);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deleteComplaint = async (complaintId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resolved complaint?"
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

      setComplaints((prev) =>
        prev.filter(
          (complaint) => complaint._id !== complaintId
        )
      );

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

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredComplaints = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return complaints.filter((complaint) => {
      const searchableText = [
        complaint.category,
        complaint.block,
        complaint.room,
        complaint.description,
        complaint.status,
        complaint.priority,
        complaint.user?.name,
        complaint.user?.email,
        complaint.user?.classSection,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search || searchableText.includes(search);

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

  // =========================================================
  // SORT
  // =========================================================

  const sortedComplaints = useMemo(() => {
    return [...filteredComplaints].sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );
  }, [filteredComplaints]);

  const displayedComplaints = showAllComplaints
    ? sortedComplaints
    : sortedComplaints.slice(0, 3);

  // =========================================================
  // STATS
  // =========================================================

  const totalComplaints = complaints.length;

  const assignedComplaints = complaints.filter(
    (complaint) => complaint.status === "Assigned"
  ).length;

  const inProgressComplaints = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  const highPriorityComplaints = complaints.filter(
    (complaint) => complaint.priority === "High"
  ).length;

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setShowAllComplaints(false);
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
            <div className="h-12 w-36 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-5 py-10">

          <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="mt-8 h-28 animate-pulse rounded-2xl bg-white" />

          <div className="mt-8 space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </div>

        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6">

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">

            <img
              src="https://www.medicaps.ac.in/public/frontend/images/medicaps-logo-fin.webp"
              alt="Medi-Caps University"
              className="h-11 w-auto object-contain sm:h-14"
            />

            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

            <div className="hidden sm:block">
              <p className="text-lg font-extrabold tracking-tight text-slate-900">
                Campus<span className="text-indigo-600">Fix</span>
              </p>

              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Technician Portal
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 sm:gap-4">

            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-slate-800">
                {technicianName}
              </p>

              <p className="max-w-40 truncate text-xs text-slate-500">
                {specialization}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 ring-4 ring-indigo-50">
              {technicianName.charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              onClick={() => setShowLogout(true)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:px-4"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-10">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="relative mb-8 overflow-hidden rounded-[28px] bg-slate-900 shadow-xl">

          <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950" />

          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[35px] border-white/5" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full border-[45px] border-white/5" />

          <div className="relative z-10 p-7 sm:p-10 lg:p-12">

            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

              <div className="max-w-2xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-indigo-100 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Technician Workspace
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Welcome, {technicianName}
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-indigo-100 sm:text-base">
                  Manage your assigned maintenance requests, update work
                  progress, upload completion proof, and keep every task
                  properly tracked.
                </p>

              </div>


              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg">
                    🔧
                  </div>

                  <div className="min-w-0">

                    <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">
                      Your Specialization
                    </p>

                    <p className="mt-1 truncate text-lg font-extrabold text-white">
                      {specialization}
                    </p>

                    <p className="mt-1 text-xs text-indigo-200">
                      Maintenance team member
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            DASHBOARD HEADING
        =================================================== */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>

            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              Overview
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Maintenance Dashboard
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your assigned complaints and current work status.
            </p>

          </div>

          <button
            type="button"
            onClick={() => fetchComplaints(true)}
            disabled={refreshing}
            className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={refreshing ? "animate-spin" : ""}>
              ↻
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </div>


        {/* ===================================================
            STATS
        =================================================== */}

        <div className="mb-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Total Assigned
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {totalComplaints}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  All assigned requests
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                📋
              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Pending Work
                </p>

                <p className="mt-2 text-3xl font-black text-amber-600">
                  {assignedComplaints}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Waiting to be started
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                ⏳
              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-black text-violet-600">
                  {inProgressComplaints}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Currently working
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                ⚙️
              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Resolved
                </p>

                <p className="mt-2 text-3xl font-black text-emerald-600">
                  {resolvedComplaints}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Successfully completed
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                ✓
              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            PRIORITY ALERT
        =================================================== */}

        {highPriorityComplaints > 0 && (

          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl">
                🚨
              </div>

              <div>

                <p className="font-extrabold text-red-800">
                  {highPriorityComplaints} high-priority{" "}
                  {highPriorityComplaints === 1
                    ? "complaint"
                    : "complaints"}
                </p>

                <p className="mt-1 text-sm text-red-600">
                  Review high-priority maintenance requests carefully.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() => setPriorityFilter("High")}
              className="w-fit rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              View High Priority
            </button>

          </div>

        )}


        {/* ===================================================
            FILTER PANEL
        =================================================== */}

        <section className="mb-9 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                🔎
              </div>

              <div>

                <h3 className="font-extrabold text-slate-800">
                  Find a Complaint
                </h3>

                <p className="text-xs text-slate-400">
                  Search and filter your assigned maintenance requests
                </p>

              </div>

            </div>

          </div>


          <div className="p-5 sm:p-6">

            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">

              {/* Search */}

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowAllComplaints(false);
                  }}
                  placeholder="Search by complaint, room, student..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />

              </div>


              {/* Status */}

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setShowAllComplaints(false);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              >
                <option value="All">All Status</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>


              {/* Priority */}

              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setShowAllComplaints(false);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              >
                <option value="All">All Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>


              {/* Reset */}

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                Reset
              </button>

            </div>

          </div>

        </section>


        {/* ===================================================
            COMPLAINT SECTION HEADER
        =================================================== */}

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg text-white">
                🛠️
              </div>

              <div>

                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                  {showAllComplaints
                    ? "All Complaints"
                    : "Recent Complaints"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {sortedComplaints.length === 0
                    ? "No matching complaints"
                    : showAllComplaints
                    ? `Showing all ${sortedComplaints.length} complaint${
                        sortedComplaints.length !== 1
                          ? "s"
                          : ""
                      }`
                    : `Showing latest ${Math.min(
                        sortedComplaints.length,
                        3
                      )} complaint${
                        Math.min(sortedComplaints.length, 3) !== 1
                          ? "s"
                          : ""
                      }`}
                </p>

              </div>

            </div>

          </div>


          {/* ALWAYS VISIBLE */}

          <button
            type="button"
            onClick={() =>
              setShowAllComplaints((prev) => !prev)
            }
            className="w-fit rounded-xl border border-indigo-200 bg-white px-5 py-3 text-sm font-extrabold text-indigo-600 shadow-sm transition hover:bg-indigo-50 hover:shadow-md"
          >
            {showAllComplaints
              ? "↑ Show Recent"
              : "View All Complaints →"}
          </button>

        </div>


        {/* ===================================================
            NO RESULTS
        =================================================== */}

        {sortedComplaints.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
              🔍
            </div>

            <h3 className="mt-6 text-xl font-black text-slate-800">
              No complaints found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try changing your search or filters to find the complaint
              you are looking for.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div className="space-y-5">

            {displayedComplaints.map((complaint, index) => {

              const isExpanded =
                expandedComplaints[complaint._id];

              const progress = getProgress(
                complaint.status
              );

              return (

                <article
                  key={complaint._id}
                  className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 ${
                    isExpanded
                      ? "border-indigo-200 shadow-lg"
                      : "border-slate-200 hover:border-indigo-200 hover:shadow-md"
                  }`}
                >

                  {/* =================================================
                      COMPACT COMPLAINT HEADER
                  ================================================= */}

                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      <div className="flex min-w-0 items-start gap-4">

                        {/* Number */}

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 font-black text-indigo-600">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-500">
                              Maintenance Request
                            </span>

                            {complaint.priority && (
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${getPriorityStyle(
                                  complaint.priority
                                )}`}
                              >
                                {complaint.priority} Priority
                              </span>
                            )}

                          </div>

                          <h4 className="mt-1 truncate text-xl font-black text-slate-900 sm:text-2xl">
                            {complaint.category ||
                              "Maintenance Issue"}
                          </h4>

                          <p className="mt-1 text-sm text-slate-500">
                            📍 {complaint.block || "Unknown Block"} •
                            Room {complaint.room || "N/A"}
                          </p>

                        </div>

                      </div>


                      <div className="flex shrink-0 items-center gap-3">

                        <span
                          className={`rounded-full border px-4 py-2 text-xs font-extrabold ${getStatusStyle(
                            complaint.status
                          )}`}
                        >
                          {complaint.status === "Resolved"
                            ? "✓ "
                            : ""}
                          {complaint.status || "Pending"}
                        </span>

                      </div>

                    </div>


                    {/* =================================================
                        QUICK INFORMATION
                    ================================================= */}

                    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">

                      <div className="rounded-xl bg-slate-50 px-4 py-3">

                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          Reported By
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-slate-700">
                          {complaint.user?.name || "Unknown Student"}
                        </p>

                      </div>


                      <div className="rounded-xl bg-slate-50 px-4 py-3">

                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          Complaint Raised
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {formatDateTime(
                            complaint.createdAt
                          )}
                        </p>

                      </div>


                      <div className="rounded-xl bg-slate-50 px-4 py-3">

                        <div className="flex items-center justify-between">

                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                            Work Progress
                          </p>

                          <span className="text-xs font-black text-indigo-600">
                            {progress}%
                          </span>

                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              complaint.status === "Resolved"
                                ? "bg-emerald-500"
                                : complaint.status ===
                                  "In Progress"
                                ? "bg-violet-500"
                                : "bg-amber-500"
                            }`}
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      READ MORE
                  ================================================= */}

                  {!isExpanded && (

                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">

                      <button
                        type="button"
                        onClick={() =>
                          toggleComplaint(
                            complaint._id
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-100 transition hover:bg-indigo-50 hover:shadow-md"
                      >
                        Read More
                        <span>↓</span>
                      </button>

                    </div>

                  )}


                  {/* =================================================
                      FULL DETAILS
                  ================================================= */}

                  {isExpanded && (

                    <div className="border-t border-indigo-100">

                      {/* =============================================
                          STUDENT INFORMATION
                      ============================================= */}

                      <section className="p-5 sm:p-6">

                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">

                          <div className="mb-5 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                              👨‍🎓
                            </div>

                            <div>

                              <h5 className="font-extrabold text-slate-800">
                                Student Information
                              </h5>

                              <p className="text-xs text-slate-500">
                                Details of the student who reported this complaint
                              </p>

                            </div>

                          </div>


                          <div className="grid gap-3 sm:grid-cols-3">

                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                Name
                              </p>

                              <p className="mt-2 truncate font-bold text-slate-700">
                                {complaint.user?.name ||
                                  "Unknown"}
                              </p>

                            </div>


                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                Email
                              </p>

                              <p className="mt-2 truncate text-sm font-semibold text-slate-600">
                                {complaint.user?.email ||
                                  "No email"}
                              </p>

                            </div>


                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                Class / Section
                              </p>

                              <p className="mt-2 font-bold text-indigo-600">
                                🎓{" "}
                                {complaint.user?.classSection ||
                                  "Not available"}
                              </p>

                            </div>

                          </div>

                        </div>

                      </section>


                      {/* =============================================
                          DESCRIPTION
                      ============================================= */}

                      <section className="px-5 pb-5 sm:px-6">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                              📝
                            </div>

                            <div>

                              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                Problem Description
                              </p>

                            </div>

                          </div>

                          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                            {complaint.description ||
                              "No description provided."}
                          </p>

                        </div>

                      </section>


                      {/* =============================================
                          TIMELINE
                      ============================================= */}

                      <section className="px-5 pb-5 sm:px-6">

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                          <div className="mb-5 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                              🕒
                            </div>

                            <div>

                              <h5 className="font-extrabold text-slate-800">
                                Complaint Timeline
                              </h5>

                              <p className="text-xs text-slate-500">
                                Track the complete maintenance journey
                              </p>

                            </div>

                          </div>


                          <div className="grid gap-3 md:grid-cols-3">

                            {/* Raised */}

                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                                  ✓
                                </div>

                                <p className="font-bold text-slate-800">
                                  Complaint Raised
                                </p>

                              </div>

                              <p className="mt-3 text-xs leading-5 text-slate-500">
                                Student submitted the maintenance request.
                              </p>

                              <p className="mt-2 text-xs font-bold text-blue-600">
                                {formatDateTime(
                                  complaint.createdAt
                                )}
                              </p>

                            </div>


                            {/* Assigned */}

                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                              <div className="flex items-center gap-3">

                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                                    complaint.assignedAt
                                      ? "bg-amber-100 text-amber-600"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {complaint.assignedAt
                                    ? "✓"
                                    : "2"}
                                </div>

                                <p
                                  className={`font-bold ${
                                    complaint.assignedAt
                                      ? "text-slate-800"
                                      : "text-slate-400"
                                  }`}
                                >
                                  Technician Assigned
                                </p>

                              </div>

                              {complaint.assignedAt ? (

                                <>

                                  <p className="mt-3 text-xs leading-5 text-slate-500">
                                    Assigned to{" "}
                                    <span className="font-bold text-amber-600">
                                      {technicianName}
                                    </span>
                                  </p>

                                  <p className="mt-2 text-xs font-bold text-amber-600">
                                    {formatDateTime(
                                      complaint.assignedAt
                                    )}
                                  </p>

                                </>

                              ) : (

                                <p className="mt-3 text-xs text-slate-400">
                                  Assignment time not available.
                                </p>

                              )}

                            </div>


                            {/* Resolved */}

                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                              <div className="flex items-center gap-3">

                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                                    complaint.resolvedAt
                                      ? "bg-emerald-100 text-emerald-600"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {complaint.resolvedAt
                                    ? "✓"
                                    : "3"}
                                </div>

                                <p
                                  className={`font-bold ${
                                    complaint.resolvedAt
                                      ? "text-slate-800"
                                      : "text-slate-400"
                                  }`}
                                >
                                  Resolution
                                </p>

                              </div>

                              {complaint.resolvedAt ? (

                                <>

                                  <p className="mt-3 text-xs leading-5 text-slate-500">
                                    Maintenance issue resolved successfully.
                                  </p>

                                  <p className="mt-2 text-xs font-bold text-emerald-600">
                                    {formatDateTime(
                                      complaint.resolvedAt
                                    )}
                                  </p>

                                </>

                              ) : (

                                <p className="mt-3 text-xs text-slate-400">
                                  Waiting for resolution.
                                </p>

                              )}

                            </div>

                          </div>

                        </div>

                      </section>


                      {/* =============================================
                          PHOTOS
                      ============================================= */}

                      <section className="grid gap-5 px-5 pb-5 sm:px-6 lg:grid-cols-2">

                        {/* Problem Photo */}

                        {complaint.image && (

                          <div className="rounded-2xl border border-slate-200 bg-white p-5">

                            <div className="mb-4 flex items-center justify-between">

                              <div>

                                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                  Problem Photo
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  Uploaded by student
                                </p>

                              </div>

                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                                Reported
                              </span>

                            </div>

                            <img
                              src={complaint.image}
                              alt="Reported problem"
                              className="h-64 w-full rounded-xl object-cover shadow-sm"
                            />

                          </div>

                        )}


                        {/* Completion Photo */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5">

                          <div className="mb-4 flex items-center justify-between">

                            <div>

                              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                Completion Photo
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Proof of completed maintenance work
                              </p>

                            </div>

                            {complaint.completionImage && (

                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold text-emerald-600">
                                ✓ Uploaded
                              </span>

                            )}

                          </div>


                          {!complaint.completionImage ? (

                            <>

                              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50">

                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                                  📸
                                </span>

                                <span className="mt-4 text-sm font-extrabold text-slate-700">
                                  Upload Completion Photo
                                </span>

                                <span className="mt-1 text-xs text-slate-400">
                                  JPG, PNG or WEBP
                                </span>

                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  className="hidden"
                                  disabled={
                                    uploadingId ===
                                    complaint._id
                                  }
                                  onChange={(e) => {
                                    const file =
                                      e.target.files?.[0];

                                    if (file) {
                                      handleCompletionPhoto(
                                        complaint._id,
                                        file
                                      );
                                    }

                                    e.target.value = "";
                                  }}
                                />

                              </label>

                              {uploadingId === complaint._id && (

                                <div className="mt-3 rounded-xl bg-indigo-50 px-4 py-3 text-center">

                                  <p className="text-sm font-bold text-indigo-600">
                                    Uploading completion photo...
                                  </p>

                                </div>

                              )}

                            </>

                          ) : (

                            <div>

                              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700">

                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                                  ✓
                                </span>

                                Completion proof uploaded

                              </div>

                              <img
                                src={complaint.completionImage}
                                alt="Completed maintenance work"
                                className="h-64 w-full rounded-xl object-cover shadow-sm"
                              />

                            </div>

                          )}

                        </div>

                      </section>


                      {/* =============================================
                          WORK ACTIONS
                      ============================================= */}

                      <section className="border-t border-slate-100 bg-slate-50 p-5 sm:p-6">

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                          <div>

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                                ⚙️
                              </div>

                              <div>

                                <p className="font-extrabold text-slate-800">
                                  Work Status
                                </p>

                                <p className="text-xs text-slate-500">
                                  Update the task as maintenance progresses.
                                </p>

                              </div>

                            </div>

                          </div>


                          <div className="flex flex-wrap gap-2">

                            {complaint.status === "Assigned" && (

                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(
                                    complaint._id,
                                    "In Progress"
                                  )
                                }
                                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-violet-700 hover:shadow-md"
                              >
                                ⚙️ Start Work
                              </button>

                            )}


                            {complaint.status === "In Progress" && (

                              <button
                                type="button"
                                disabled={
                                  !complaint.completionImage
                                }
                                onClick={() =>
                                  updateStatus(
                                    complaint._id,
                                    "Resolved"
                                  )
                                }
                                className={`rounded-xl px-5 py-3 text-sm font-extrabold text-white shadow-sm transition ${
                                  complaint.completionImage
                                    ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-md"
                                    : "cursor-not-allowed bg-slate-300"
                                }`}
                              >
                                ✓ Mark as Resolved
                              </button>

                            )}


                            {complaint.status === "Resolved" && (

                              <div className="flex flex-wrap items-center gap-3">

                                <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-700">
                                  ✓ Work Completed
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteComplaint(
                                      complaint._id
                                    )
                                  }
                                  className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-extrabold text-red-600 transition hover:bg-red-50"
                                >
                                  🗑️ Delete
                                </button>

                              </div>

                            )}

                          </div>

                        </div>

                      </section>


                      {/* =============================================
                          SHOW LESS
                      ============================================= */}

                      <div className="border-t border-slate-100 bg-white p-5 sm:p-6">

                        <button
                          type="button"
                          onClick={() =>
                            toggleComplaint(
                              complaint._id
                            )
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
                        >
                          Show Less
                          <span>↑</span>
                        </button>

                      </div>

                    </div>

                  )}

                </article>

              );
            })}

          </div>

        )}


        {/* ===================================================
            RESULT FOOTER
        =================================================== */}

        {sortedComplaints.length > 0 && (

          <div className="mt-7 text-center">

            <p className="text-xs font-medium text-slate-400">
              Showing {displayedComplaints.length} of{" "}
              {sortedComplaints.length} matching complaints
            </p>

          </div>

        )}

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-7 text-center sm:px-6">

          <p className="font-extrabold text-slate-800">
            Campus<span className="text-indigo-600">Fix</span>
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Campus Maintenance Management System • Medi-Caps University
          </p>

        </div>

      </footer>


      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
      />

    </div>
  );
}

export default TechnicianDashboard;