
import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutModal from "../components/LogoutModal";

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [showLogout, setShowLogout] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= FETCH COMPLAINTS =================
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/complaints/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.log("Failed to fetch complaints:", error);
    }
  };

  // ================= FETCH TECHNICIANS =================
  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/technicians", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTechnicians(response.data.technicians || []);
    } catch (error) {
      console.log("Failed to fetch technicians:", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchTechnicians();
  }, []);

  // ================= ASSIGN COMPLAINT =================
  const assignComplaint = async (complaintId, technicianId) => {
    if (!technicianId) return;

    try {
      const token = localStorage.getItem("token");

      const response = await api.patch(
        `/complaints/${complaintId}/assign`,
        { technicianId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                technician: technicianId,
                status: "Assigned",
              }
            : complaint
        )
      );
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
      complaint.category?.toLowerCase().includes(search) ||
      complaint.block?.toLowerCase().includes(search) ||
      complaint.room?.toLowerCase().includes(search) ||
      complaint.description?.toLowerCase().includes(search) ||
      complaint.user?.name?.toLowerCase().includes(search) ||
      complaint.user?.email?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">

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
                Administrator
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
              Admin Control Center 👨‍💼
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-indigo-100">
              Monitor campus maintenance requests, manage complaints,
              assign technicians and track resolution progress from one
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
                  👨‍🔧
                </div>
              </div>

              <p className="mt-4 text-3xl font-extrabold text-orange-600">
                {assignedComplaints}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Technician assigned
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


        {/* ================= ALL COMPLAINTS HEADER ================= */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-700 p-6 sm:p-8">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="text-white">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                  🛠️ Maintenance Management
                </div>

                <h2 className="text-2xl font-extrabold sm:text-3xl">
                  All Complaints
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
                  Manage campus maintenance requests, assign technicians
                  and monitor every complaint from one place.
                </p>

              </div>


              <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl">
                  📋
                </div>

                <div>
                  <p className="text-2xl font-extrabold text-white">
                    {filteredComplaints.length}
                  </p>

                  <p className="text-xs font-medium text-indigo-100">
                    Showing complaints
                  </p>
                </div>

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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by complaint, student, block, room..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

              </div>


              <div className="flex flex-wrap gap-2">

                {[
                  { name: "All", icon: "📋" },
                  { name: "Pending", icon: "⏳" },
                  { name: "Assigned", icon: "👨‍🔧" },
                  { name: "In Progress", icon: "🔧" },
                  { name: "Resolved", icon: "✅" },
                ].map((filter) => (

                  <button
                    key={filter.name}
                    onClick={() => setStatusFilter(filter.name)}
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
        {filteredComplaints.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-4xl">
              {searchTerm || statusFilter !== "All" ? "🔎" : "📋"}
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

            {(searchTerm || statusFilter !== "All") && (
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

            {filteredComplaints.map((complaint) => (

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
                            {complaint.user?.name || "Unknown Student"}
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
                        {complaint.status === "Resolved" && "✓ "}
                        {complaint.status === "In Progress" && "⚙ "}
                        {complaint.status === "Assigned" && "👨‍🔧 "}
                        {complaint.status === "Pending" && "⏳ "}
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


                  {/* INFO GRID */}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                    {/* LOCATION */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition group-hover:bg-indigo-50/40">

                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <span className="text-base">📍</span>
                        Location
                      </div>

                      <p className="mt-2 font-bold text-slate-700 text-xl">
                        {complaint.block}
                      </p>

                      <p className="mt-0.5 text-s text-slate-500 font-semibold">
                        Room {complaint.room}
                      </p>

                    </div>


                    {/* STUDENT */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition group-hover:bg-indigo-50/40">

                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <span className="text-base">👨‍🎓</span>
                        Student
                      </div>

                      <p className="mt-2 truncate font-bold text-slate-700">
                        {complaint.user?.name || "Unknown"}
                      </p>

                      <p className="mt-0.5 truncate text-s text-slate-500 font-semibold ">
                        {complaint.user?.email || "No email"}
                      </p>

                    </div>


                    {/* TECHNICIAN */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition group-hover:bg-indigo-50/40">

                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <span className="text-base">👨‍🔧</span>
                        Technician
                      </div>

                      <p className="mt-2 truncate font-bold text-slate-700">
                        {technicians.find(
                          (technician) =>
                            technician._id === complaint.technician
                        )?.name || "Not assigned"}
                      </p>

                      <p className="mt-0.5 text-s text-slate-500 font-semibold">
                        {complaint.status === "Resolved"
                          ? "Task completed"
                          : complaint.technician
                          ? "Currently assigned"
                          : "Waiting for assignment"}
                      </p>

                    </div>


                    {/* PRIORITY */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition group-hover:bg-indigo-50/40">

                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <span className="text-base">⚡</span>
                        Priority
                      </div>

                      <p
                        className={`mt-2 font-extrabold ${getPriorityStyle(
                          complaint.priority
                        )
                          .replace("border-red-100 bg-red-50 ", "")
                          .replace("border-orange-100 bg-orange-50 ", "")
                          .replace("border-emerald-100 bg-emerald-50 ", "")}`}
                      >
                        {complaint.priority}
                      </p>

                      <p className="mt-0.5 text-s text-slate-500 font-semibold">
                        Maintenance priority
                      </p>

                    </div>

                  </div>


                  {/* DESCRIPTION */}

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">

                    <div className="mb-2 flex items-center gap-2">

                      <span className="text-base">📝</span>

                      <p className="text-lg font-bold uppercase tracking-wide text-slate-700">
                        Problem Description
                      </p>

                    </div>

                    <p className="text-lg font-semibold leading-7 text-slate-600">
                      {complaint.description}
                    </p>

                  </div>


                  {/* PHOTOS */}

                  {(complaint.image || complaint.completionImage) && (

                    <div className="mt-4 grid gap-4 md:grid-cols-2">

                      {complaint.image && (

                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4">

                          <div className="mb-3 flex items-center gap-2">

                            <span>📷</span>

                            <p className="text-s font-bold uppercase tracking-wide text-slate-500">
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
                            src={complaint.completionImage}
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

                </div>


                {/* ACTION BAR */}

                <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-5 sm:px-6">

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* ASSIGN TECHNICIAN */}

                    {complaint.status !== "Resolved" ? (

                      <div className="flex-1">

                        <div className="mb-2 flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                            👨‍🔧
                          </div>

                          <p className="text-s font-bold text-slate-700">
                            Technician Assignment
                          </p>

                        </div>

                        <select
                          defaultValue={complaint.technician || ""}
                          onChange={(e) =>
                            assignComplaint(
                              complaint._id,
                              e.target.value
                            )
                          }
                          className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3 text-s font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        >

                          <option value="" disabled>
                            Select technician
                          </option>

                          {technicians.map((technician) => (

                            <option
                              key={technician._id}
                              value={technician._id}
                            >
                              {technician.name} - {technician.email}
                            </option>

                          ))}

                        </select>

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
                      onClick={() => deleteComplaint(complaint._id)}
                      className="rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 hover:shadow-lg active:scale-[0.98]"
                    >
                      🗑️ Delete Complaint
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>


      {/* ================= ADMIN TIP ================= */}
      <section className="mx-auto max-w-7xl px-6 pb-10">

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">

          <div className="flex gap-4">

            <div className="text-2xl">
              💡
            </div>

            <div>

              <h3 className="font-bold text-indigo-900">
                Admin Tip
              </h3>

              <p className="mt-2 text-sm leading-6 text-indigo-700">
                Assign pending complaints to the appropriate technician
                as soon as possible. Clear issue details and completion
                photos help maintain transparency and faster resolution.
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
  );
}

export default AdminDashboard;