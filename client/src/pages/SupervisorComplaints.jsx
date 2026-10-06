
// import React, { useEffect, useState } from "react";
// import { Bell, CheckCheck, Clock } from "lucide-react";
// import api from "../services/api";
// import { useNavigate } from "react-router-dom";

// const Notifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();

//   // --------------------------------------------------
//   // FETCH NOTIFICATIONS
//   // --------------------------------------------------
//   const fetchNotifications = async () => {
//     try {
//       setLoading(true);

//       const response = await api.get("/notifications");

//       setNotifications(response.data.notifications || []);
//     } catch (error) {
//       console.error(
//         "Failed to fetch notifications:",
//         error
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   // --------------------------------------------------
//   // MARK AS READ
//   // --------------------------------------------------
//   const markAsRead = async (notificationId) => {
//     try {
//       await api.patch(
//         `/notifications/${notificationId}/read`
//       );

//       setNotifications((prev) =>
//         prev.map((notification) =>
//           notification._id === notificationId
//             ? {
//                 ...notification,
//                 isRead: true,
//               }
//             : notification
//         )
//       );
//     } catch (error) {
//       console.error(
//         "Failed to mark notification as read:",
//         error
//       );
//     }
//   };

//   // --------------------------------------------------
//   // OPEN RELATED COMPLAINT
//   // --------------------------------------------------
//   const handleNotificationClick = async (
//     notification
//   ) => {
//     // Mark notification as read first
//     if (!notification.isRead) {
//       await markAsRead(notification._id);
//     }

//     // Try to get complaint ID from notification
//     const complaintId =
//       notification.complaintId ||
//       notification.complaint?._id ||
//       notification.data?.complaintId ||
//       notification.metadata?.complaintId;

//     // If complaint is connected to notification
//     if (complaintId) {
//       navigate("/supervisor/complaints", {
//         state: {
//           complaintId,
//         },
//       });

//       return;
//     }

//     // If no complaint ID exists
//     console.warn(
//       "No complaint ID found in notification:",
//       notification
//     );
//   };

//   const unreadCount = notifications.filter(
//     (notification) => !notification.isRead
//   ).length;

//   return (
//     <div className="min-h-screen bg-slate-50 p-6">
//       <div className="mx-auto max-w-4xl">

//         {/* HEADER */}
//         <div className="mb-6 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
//               <Bell size={22} />
//             </div>

//             <div>
//               <h1 className="text-2xl font-bold text-slate-900">
//                 Notifications
//               </h1>

//               <p className="text-sm text-slate-500">
//                 Stay updated with your CampusFix activities
//               </p>
//             </div>
//           </div>

//           {unreadCount > 0 && (
//             <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
//               {unreadCount} Unread
//             </div>
//           )}
//         </div>

//         {/* LOADING */}
//         {loading && (
//           <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
//             <p className="text-slate-500">
//               Loading notifications...
//             </p>
//           </div>
//         )}

//         {/* EMPTY */}
//         {!loading && notifications.length === 0 && (
//           <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
//             <Bell
//               size={42}
//               className="mx-auto mb-4 text-slate-300"
//             />

//             <h2 className="text-lg font-semibold text-slate-700">
//               No notifications
//             </h2>

//             <p className="mt-1 text-sm text-slate-400">
//               You're all caught up.
//             </p>
//           </div>
//         )}

//         {/* NOTIFICATIONS */}
//         {!loading && notifications.length > 0 && (
//           <div className="space-y-3">
//             {notifications.map((notification) => (
//               <div
//                 key={notification._id}
//                 onClick={() =>
//                   handleNotificationClick(notification)
//                 }
//                 className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
//                   notification.isRead
//                     ? "border-slate-200 bg-white"
//                     : "border-blue-200 bg-blue-50"
//                 }`}
//               >
//                 <div className="flex gap-4">

//                   {/* ICON */}
//                   <div
//                     className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
//                       notification.isRead
//                         ? "bg-slate-100 text-slate-500"
//                         : "bg-blue-600 text-white"
//                     }`}
//                   >
//                     {notification.isRead ? (
//                       <CheckCheck size={20} />
//                     ) : (
//                       <Bell size={20} />
//                     )}
//                   </div>

//                   {/* CONTENT */}
//                   <div className="min-w-0 flex-1">
//                     <div className="flex flex-wrap items-start justify-between gap-2">
//                       <h3 className="font-semibold text-slate-900">
//                         {notification.title}
//                       </h3>

//                       {!notification.isRead && (
//                         <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
//                           NEW
//                         </span>
//                       )}
//                     </div>

//                     <p className="mt-1 text-sm leading-6 text-slate-600">
//                       {notification.message}
//                     </p>

//                     <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
//                       <Clock size={14} />

//                       {new Date(
//                         notification.createdAt
//                       ).toLocaleString("en-IN")}
//                     </div>

//                     {/* RELATED COMPLAINT INDICATOR */}
//                     {(notification.complaintId ||
//                       notification.complaint?._id ||
//                       notification.data?.complaintId ||
//                       notification.metadata?.complaintId) && (
//                       <div className="mt-3 text-xs font-semibold text-blue-600">
//                         Click to view related complaint →
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Notifications;


import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import SupervisorSidebar from "../components/SupervisorSidebar";
import LogoutModal from "../components/LogoutModal";

function SupervisorComplaints() {
  const location = useLocation();

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
  const [previewImage, setPreviewImage] = useState(null);

  // Selected complaint coming from Dashboard / Notification
  const selectedComplaintId = location.state?.complaintId || null;

  // Read More state
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const assignedBlocks = user?.assignedBlocks || [];

  // --------------------------------------------------
  // FETCH COMPLAINTS
  // --------------------------------------------------

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/supervisor/complaints");

      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.error(
        "FETCH SUPERVISOR COMPLAINTS ERROR:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH TECHNICIANS
  // --------------------------------------------------

  const fetchTechnicians = async () => {
    try {
      const response = await api.get(
        "/supervisor/technicians"
      );

      setTechnicians(response.data.technicians || []);
    } catch (error) {
      console.error(
        "FETCH TECHNICIANS ERROR:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load technicians."
      );
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchTechnicians();
  }, []);

  // --------------------------------------------------
  // SPECIALIZATION MAPPING
  // --------------------------------------------------

  const specializationMap = {
    Computer: "Computer Technician",
    Fan: "Electrician",
    Light: "Electrician",
    AC: "AC Technician",
    Door: "Carpenter",
    Furniture: "Carpenter",
  };

  // --------------------------------------------------
  // QUALIFIED TECHNICIANS
  // --------------------------------------------------

  const getTechniciansForComplaint = (category) => {
    const requiredSpecialization =
      specializationMap[category];

    if (!requiredSpecialization) {
      return technicians;
    }

    return technicians.filter(
      (technician) =>
        technician.specialization ===
        requiredSpecialization
    );
  };

  // --------------------------------------------------
  // ASSIGN TECHNICIAN
  // --------------------------------------------------

  const handleAssignTechnician = async (complaintId) => {
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

      const response = await api.patch(
        `/supervisor/complaints/${complaintId}/assign-technician`,
        {
          technicianId,
        }
      );

      setMessage(
        response.data.message ||
          "Technician assigned successfully."
      );

      await fetchComplaints();

      setSelectedTechnician((previous) => {
        const updated = { ...previous };

        delete updated[complaintId];

        return updated;
      });
    } catch (error) {
      console.error(
        "ASSIGN TECHNICIAN ERROR:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to assign technician."
      );
    } finally {
      setAssigningId(null);
    }
  };

  // --------------------------------------------------
  // FILTER COMPLAINTS
  // --------------------------------------------------

  const filteredComplaints = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesSearch =
        !search ||
        complaint.block
          ?.toLowerCase()
          .includes(search) ||
        complaint.floor
          ?.toString()
          .toLowerCase()
          .includes(search) ||
        complaint.room
          ?.toString()
          .toLowerCase()
          .includes(search) ||
        complaint.category
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

  // --------------------------------------------------
  // SINGLE SELECTED COMPLAINT
  // --------------------------------------------------

  const visibleComplaints = useMemo(() => {
    if (!selectedComplaintId) {
      return filteredComplaints;
    }

    return complaints.filter(
      (complaint) =>
        complaint._id === selectedComplaintId
    );
  }, [
    complaints,
    filteredComplaints,
    selectedComplaintId,
  ]);

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "Pending" ||
      !complaint.technician
  ).length;

  const activeComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "Assigned" ||
      complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "Resolved"
  ).length;

  const highPriorityComplaints =
    complaints.filter(
      (complaint) =>
        complaint.priority === "High"
    ).length;

  // --------------------------------------------------
  // STYLES
  // --------------------------------------------------

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "Assigned":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "In Progress":
        return "border-violet-200 bg-violet-50 text-violet-700";

      case "Resolved":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "border-red-200 bg-red-50 text-red-700";

      case "Medium":
        return "border-orange-200 bg-orange-50 text-orange-700";

      case "Low":
        return "border-green-200 bg-green-50 text-green-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  // --------------------------------------------------
  // DATE FORMAT
  // --------------------------------------------------

  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // --------------------------------------------------
  // FILTER COUNT
  // --------------------------------------------------

  const getFilterCount = (filter) => {
    if (filter === "All") {
      return complaints.length;
    }

    if (filter === "Pending") {
      return pendingComplaints;
    }

    if (filter === "Assigned") {
      return complaints.filter(
        (complaint) =>
          complaint.status === "Assigned"
      ).length;
    }

    if (filter === "In Progress") {
      return complaints.filter(
        (complaint) =>
          complaint.status === "In Progress"
      ).length;
    }

    if (filter === "Resolved") {
      return resolvedComplaints;
    }

    return 0;
  };

  // --------------------------------------------------
  // BACK TO ALL COMPLAINTS
  // --------------------------------------------------

  const handleBackToAll = () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

    window.location.reload();
  };

  // --------------------------------------------------
  // TOGGLE READ MORE
  // --------------------------------------------------

  const toggleDescription = (complaintId) => {
    setExpandedComplaintId((previous) =>
      previous === complaintId
        ? null
        : complaintId
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SupervisorSidebar
        onLogout={() => setShowLogout(true)}
      />

      <main className="min-h-screen lg:ml-72">
        <div className="p-4 sm:p-6 lg:p-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Supervisor Operations
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                  Complaint Management
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
                  Review maintenance complaints,
                  inspect reported issues and assign
                  the appropriate technician.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                  Supervisor Access
                </p>

                <p className="mt-1 text-lg font-black">
                  {assignedBlocks.length
                    ? assignedBlocks.join(", ")
                    : "All Campus"}
                </p>

                <p className="mt-1 text-xs text-indigo-200">
                  {totalComplaints} total complaints
                </p>
              </div>
            </div>
          </section>

          {/* ==================================================
              SINGLE COMPLAINT MODE
          ================================================== */}

          {selectedComplaintId && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-black text-indigo-900">
                  Viewing Selected Complaint
                </p>

                <p className="mt-1 text-xs text-indigo-700">
                  You opened this complaint from the
                  dashboard or notification.
                </p>
              </div>

              <button
                type="button"
                onClick={handleBackToAll}
                className="w-fit rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-indigo-700"
              >
                ← Back to All Complaints
              </button>
            </div>
          )}

          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {message && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              <span className="text-lg">✓</span>

              <span>{message}</span>
            </div>
          )}

          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">

              <span className="text-lg">!</span>

              <span>{errorMessage}</span>

              <button
                type="button"
                onClick={() =>
                  setErrorMessage("")
                }
                className="ml-auto text-red-400 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* ==================================================
              STATISTICS
          ================================================== */}

          {!selectedComplaintId && (
            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Total
                    </p>

                    <p className="mt-2 text-3xl font-black text-slate-900">
                      {totalComplaints}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    📋
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Pending
                    </p>

                    <p className="mt-2 text-3xl font-black text-amber-600">
                      {pendingComplaints}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                    ⏳
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Active
                    </p>

                    <p className="mt-2 text-3xl font-black text-violet-600">
                      {activeComplaints}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                    🔧
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Resolved
                    </p>

                    <p className="mt-2 text-3xl font-black text-emerald-600">
                      {resolvedComplaints}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                    ✓
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      High Priority
                    </p>

                    <p className="mt-2 text-3xl font-black text-red-600">
                      {highPriorityComplaints}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                    ⚠️
                  </div>
                </div>
              </div>

            </section>
          )}

          {/* ==================================================
              SEARCH / FILTERS
          ================================================== */}

          {!selectedComplaintId && (
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="mb-4">
                <h2 className="text-base font-black text-slate-800">
                  Find Complaints
                </h2>

                <p className="text-xs text-slate-500">
                  Search and filter maintenance complaints.
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔎
                  </span>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    placeholder="Search block, floor, room, category..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white"
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

                <select
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(e.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white"
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

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                    setPriorityFilter("All");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  Reset
                </button>

              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

                {[
                  "All",
                  "Pending",
                  "Assigned",
                  "In Progress",
                  "Resolved",
                ].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      setStatusFilter(filter)
                    }
                    className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-bold transition ${
                      statusFilter === filter
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}
                  >
                    {filter}

                    <span
                      className={`ml-1.5 rounded-md px-1.5 py-0.5 text-[10px] ${
                        statusFilter === filter
                          ? "bg-white/20"
                          : "bg-slate-100"
                      }`}
                    >
                      {getFilterCount(filter)}
                    </span>
                  </button>
                ))}

              </div>
            </section>
          )}

          {/* ==================================================
              TITLE
          ================================================== */}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-black text-slate-900">
                {selectedComplaintId
                  ? "Complaint Details"
                  : "Maintenance Complaints"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {selectedComplaintId
                  ? "Detailed view of the selected maintenance complaint."
                  : `Showing ${visibleComplaints.length} of ${totalComplaints} complaints`}
              </p>
            </div>

            {!selectedComplaintId && (
              <button
                type="button"
                onClick={() => {
                  fetchComplaints();
                  fetchTechnicians();
                }}
                className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                ↻ Refresh
              </button>
            )}

          </div>

          {/* ==================================================
              COMPLAINTS
          ================================================== */}

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm">

              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

              <p className="mt-5 text-sm font-bold text-slate-600">
                Loading complaints...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Fetching current maintenance operations.
              </p>

            </div>
          ) : visibleComplaints.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                📋
              </div>

              <h2 className="mt-5 text-lg font-black text-slate-800">
                {selectedComplaintId
                  ? "Complaint not found"
                  : "No complaints found"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {selectedComplaintId
                  ? "This complaint may no longer be available or you may not have access to it."
                  : "No complaints match your current search and filter settings."}
              </p>

              {selectedComplaintId && (
                <button
                  type="button"
                  onClick={handleBackToAll}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black text-white hover:bg-indigo-700"
                >
                  ← Back to All Complaints
                </button>
              )}

            </div>
          ) : (

            <div
              className={
                selectedComplaintId
                  ? "mx-auto max-w-4xl"
                  : "grid gap-5 xl:grid-cols-2"
              }
            >

              {visibleComplaints.map(
                (complaint) => {
                  const categoryTechnicians =
                    getTechniciansForComplaint(
                      complaint.category
                    );

                  const isResolved =
                    complaint.status === "Resolved";

                  const currentTechnician =
                    complaint.technician?._id || "";

                  const selectedValue =
                    selectedTechnician[
                      complaint._id
                    ] || currentTechnician;

                  const requiredSkill =
                    specializationMap[
                      complaint.category
                    ] || "General Technician";

                  const isExpanded =
                    expandedComplaintId ===
                    complaint._id;

                  const description =
                    complaint.description ||
                    "No description provided.";

                  return (
                    <article
                      id={`complaint-${complaint._id}`}
                      key={complaint._id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-lg"
                    >

                      {/* ==================================================
                          CARD HEADER
                      ================================================== */}

                      <div className="border-b border-slate-100 bg-slate-50 p-4 sm:p-5">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <div className="flex flex-wrap gap-2">

                              <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-[11px] font-black text-indigo-700">
                                {complaint.category}
                              </span>

                              <span
                                className={`rounded-lg border px-2.5 py-1 text-[11px] font-black ${getPriorityColor(
                                  complaint.priority
                                )}`}
                              >
                                {complaint.priority ||
                                  "Normal"}
                              </span>

                              <span
                                className={`rounded-lg border px-2.5 py-1 text-[11px] font-black ${getStatusColor(
                                  complaint.status
                                )}`}
                              >
                                {complaint.status}
                              </span>

                            </div>

                            <h3 className="mt-3 text-base font-black text-slate-900">
                              {complaint.category} Maintenance
                            </h3>

                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              ID:{" "}
                              {complaint._id?.slice(-10)}
                            </p>

                          </div>

                          <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">

                            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                              Location
                            </p>

                            <p className="mt-1 text-xs font-black text-slate-700">
                              {complaint.block ||
                                "N/A"}

                              {complaint.floor
                                ? ` • F${complaint.floor}`
                                : ""}

                              {complaint.room
                                ? ` • R${complaint.room}`
                                : ""}
                            </p>

                          </div>

                        </div>
                      </div>

                      {/* ==================================================
                          CARD BODY
                      ================================================== */}

                      <div className="p-4 sm:p-5">

                        {/* IMAGE + DESCRIPTION */}

                        <div
                          className={
                            selectedComplaintId
                              ? "flex flex-col gap-5"
                              : "flex gap-4"
                          }
                        >

                          {/* IMAGE */}

                          <div
                            className={
                              selectedComplaintId
                                ? "w-full"
                                : "w-28 shrink-0 sm:w-32"
                            }
                          >

                            {complaint.image ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImage(
                                    complaint.image
                                  )
                                }
                                className={`group relative block w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${
                                  selectedComplaintId
                                    ? "h-64 sm:h-80"
                                    : "h-28 sm:h-32"
                                }`}
                                title="View complaint photo"
                              >

                                <img
                                  src={complaint.image}
                                  alt="Complaint"
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />

                                <span className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[9px] font-bold text-white">
                                  View Photo
                                </span>

                              </button>
                            ) : (
                              <div
                                className={`flex w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-3xl ${
                                  selectedComplaintId
                                    ? "h-64 sm:h-80"
                                    : "h-28 sm:h-32"
                                }`}
                              >
                                🧰
                              </div>
                            )}

                            <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-wide text-slate-400">
                              Complaint Photo
                            </p>

                          </div>

                          {/* DESCRIPTION */}

                          <div className="min-w-0 flex-1">

                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Issue Description
                            </p>

                            <p
                              className={`mt-2 text-sm leading-6 text-slate-700 ${
                                isExpanded
                                  ? ""
                                  : "line-clamp-4"
                              }`}
                            >
                              {description}
                            </p>

                            {description.length > 180 && (
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDescription(
                                    complaint._id
                                  )
                                }
                                className="mt-2 text-xs font-black text-indigo-600 hover:text-indigo-800 hover:underline"
                              >
                                {isExpanded
                                  ? "Read Less ↑"
                                  : "Read More →"}
                              </button>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">

                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                📍{" "}
                                {complaint.block ||
                                  "Block N/A"}
                              </span>

                              {complaint.floor && (
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                  🏢 Floor{" "}
                                  {complaint.floor}
                                </span>
                              )}

                              {complaint.room && (
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                  🚪 Room{" "}
                                  {complaint.room}
                                </span>
                              )}

                            </div>

                          </div>
                        </div>

                        {/* COMPLETION PHOTO */}

                        {complaint.completionImage && (
                          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">

                            <div className="flex items-center justify-between gap-3">

                              <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">
                                ✓ Completion Photo
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImage(
                                    complaint.completionImage
                                  )
                                }
                                className="text-[10px] font-black text-emerald-700 hover:underline"
                              >
                                View Photo
                              </button>

                            </div>

                          </div>
                        )}

                        {/* TECHNICIAN ASSIGNMENT */}

                        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">

                          <div className="flex items-start justify-between gap-3">

                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wide text-indigo-500">
                                Technician Assignment
                              </p>

                              <h4 className="mt-1 text-sm font-black text-slate-800">
                                {complaint.technician
                                  ? "Current Technician"
                                  : "Needs Technician"}
                              </h4>
                            </div>

                            <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm">

                              <p className="text-sm font-black text-indigo-700">
                                {
                                  categoryTechnicians.length
                                }
                              </p>

                              <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
                                Qualified
                              </p>

                            </div>

                          </div>

                          {complaint.technician && (
                            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white p-3">

                              <div className="flex min-w-0 items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm">
                                  🛠️
                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-xs font-black text-slate-800">
                                    {
                                      complaint
                                        .technician
                                        .name
                                    }
                                  </p>

                                  <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">
                                    {
                                      complaint
                                        .technician
                                        .specialization
                                    }
                                  </p>

                                </div>

                              </div>

                              <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-black text-blue-700">
                                Assigned
                              </span>

                            </div>
                          )}

                          {isResolved ? (
                            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">

                              <p className="text-xs font-black text-emerald-700">
                                ✓ Complaint Resolved
                              </p>

                              <p className="mt-1 text-[10px] leading-4 text-emerald-600">
                                This complaint is completed and cannot be reassigned.
                              </p>

                            </div>
                          ) : (
                            <div className="mt-4">

                              <div className="mb-2 flex items-center justify-between">

                                <label className="text-xs font-black text-slate-700">
                                  Select Technician
                                </label>

                                <span className="text-[10px] font-bold text-indigo-600">
                                  Required:{" "}
                                  {requiredSkill}
                                </span>

                              </div>

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
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                              >

                                <option value="">
                                  Select qualified technician
                                </option>

                                {categoryTechnicians.map(
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

                              {categoryTechnicians.length ===
                                0 && (
                                <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">

                                  <p className="text-[10px] font-bold leading-4 text-amber-700">
                                    No qualified technician is currently available for this complaint category.
                                  </p>

                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleAssignTechnician(
                                    complaint._id
                                  )
                                }
                                disabled={
                                  !selectedValue ||
                                  assigningId ===
                                    complaint._id ||
                                  categoryTechnicians.length ===
                                    0
                                }
                                className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                {assigningId ===
                                complaint._id
                                  ? "Assigning Technician..."
                                  : complaint.technician
                                  ? "Reassign Technician"
                                  : "Assign Technician"}
                              </button>

                            </div>
                          )}

                        </div>

                        {/* TIMELINE */}

                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            Complaint Timeline
                          </p>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">

                            <div className="flex gap-2">

                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />

                              <div>
                                <p className="text-[10px] font-black text-slate-700">
                                  Created
                                </p>

                                <p className="mt-0.5 text-[9px] text-slate-500">
                                  {formatDateTime(
                                    complaint.createdAt
                                  )}
                                </p>
                              </div>

                            </div>

                            <div className="flex gap-2">

                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />

                              <div>
                                <p className="text-[10px] font-black text-slate-700">
                                  Supervisor Assigned
                                </p>

                                <p className="mt-0.5 text-[9px] text-slate-500">
                                  {formatDateTime(
                                    complaint.assignedAt
                                  )}
                                </p>
                              </div>

                            </div>

                            <div className="flex gap-2">

                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-500" />

                              <div>
                                <p className="text-[10px] font-black text-slate-700">
                                  Technician Assigned
                                </p>

                                <p className="mt-0.5 text-[9px] text-slate-500">
                                  {formatDateTime(
                                    complaint.technicianAssignedAt
                                  )}
                                </p>
                              </div>

                            </div>

                            <div className="flex gap-2">

                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

                              <div>
                                <p className="text-[10px] font-black text-slate-700">
                                  Resolved
                                </p>

                                <p className="mt-0.5 text-[9px] text-slate-500">
                                  {formatDateTime(
                                    complaint.resolvedAt
                                  )}
                                </p>
                              </div>

                            </div>

                          </div>
                        </div>

                        {/* BACK BUTTON */}

                        {selectedComplaintId && (
                          <button
                            type="button"
                            onClick={handleBackToAll}
                            className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            ← Back to All Complaints
                          </button>
                        )}

                      </div>
                    </article>
                  );
                }
              )}

            </div>
          )}
        </div>
      </main>

      {/* ==================================================
          IMAGE PREVIEW
      ================================================== */}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              onClick={() =>
                setPreviewImage(null)
              }
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-lg font-bold text-white transition hover:bg-black"
              aria-label="Close image preview"
            >
              ✕
            </button>

            <img
              src={previewImage}
              alt="Complaint preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
            />

          </div>
        </div>
      )}

      {/* ==================================================
          LOGOUT MODAL
      ================================================== */}

      {showLogout && (
        <LogoutModal
          onClose={() =>
            setShowLogout(false)
          }
        />
      )}
    </div>
  );
}

export default SupervisorComplaints;
