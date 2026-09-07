import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoutModal from "../components/LogoutModal";

function StudentDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  // Fetch student's complaints
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/complaints/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.log("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Statistics
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

  // Status styling
  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "In Progress") {
      return "bg-purple-100 text-purple-700";
    }

    if (status === "Assigned") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  // Logout

  return (
    <div className="min-h-screen bg-slate-50">

{/* ================= NAVBAR ================= */}
<nav className="border-b border-indigo-100 bg-indigo-50 shadow-sm">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

    {/* LEFT - BRANDING */}
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


    {/* RIGHT - USER */}
    <div className="flex items-center gap-4">

      {/* User Info */}
      <div className="hidden text-right sm:block">

        <p className="text-base font-bold text-slate-800">
          {user?.name || "Student"}
        </p>

        <p className="mt-0.5 max-w-[230px] truncate text-sm text-slate-500">
          {user?.email || "No email"}
        </p>

      </div>


      {/* Avatar */}
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-base font-bold text-white shadow-sm">
        {user?.name?.charAt(0)?.toUpperCase() || "S"}
      </div>


      {/* Logout */}
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

          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>

          <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/5"></div>

          <div className="relative z-10 max-w-3xl text-white">

            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
              Medi-Caps University
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Welcome Back, {user?.name || "Student"} 👋
            </h1>

            <p className="mt-4 max-w-2xl text-indigo-100 leading-7">
              Welcome to CampusFix. Report maintenance problems,
              track your complaints and help make the campus better.
            </p>



          </div>

        </div>


        {/* ================= QUICK ACTIONS ================= */}
        <div className="mb-10 grid gap-5 md:grid-cols-2">

          {/* Report */}
          <div
            onClick={() => navigate("/student/report")}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 p-7 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            {/* Decorative Background */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition duration-500 group-hover:scale-150"></div>

            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-400/20"></div>

            <div className="relative z-10">

              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-inner backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:rotate-3">
                🛠️
              </div>

              {/* Heading */}
              <h3 className="mt-6 text-2xl font-bold">
                Report a Problem
              </h3>

              {/* Description */}
              <p className="mt-2 max-w-md leading-6 text-indigo-100">
                Found a broken fan, light, projector, computer or any other
                campus maintenance issue?
              </p>

              {/* Action */}
              <div className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 font-bold text-indigo-600 shadow-md transition group-hover:bg-indigo-50">
                Report Now
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>

            </div>
          </div>



          {/* Track */}
          {/* Track My Complaints */}
          <div
            onClick={() => navigate("/student/complaints")}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-7 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            {/* Decorative Background */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition duration-500 group-hover:scale-150"></div>

            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-teal-300/20"></div>

            <div className="relative z-10">

              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-inner backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:-rotate-3">
                📋
              </div>

              {/* Heading */}
              <h3 className="mt-6 text-2xl font-bold">
                Track My Complaints
              </h3>

              {/* Description */}
              <p className="mt-2 max-w-md leading-6 text-emerald-50">
                Check your reported issues and see their current maintenance status.
              </p>

              {/* Action */}
              <div className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 font-bold text-emerald-600 shadow-md transition group-hover:bg-emerald-50">
                View Complaints
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>

            </div>
          </div>



        </div>


        {/* ================= STATISTICS ================= */}
        <div className="mb-10">

          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-800">
              Your Complaint Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick look at your maintenance requests.
            </p>
          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            {/* Total */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-800">
                {loading ? "—" : totalComplaints}
              </p>
            </div>


            {/* Pending */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Pending
              </p>

              <p className="mt-3 text-3xl font-bold text-blue-600">
                {loading ? "—" : pendingComplaints}
              </p>
            </div>


            {/* Assigned */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Assigned
              </p>

              <p className="mt-3 text-3xl font-bold text-orange-600">
                {loading ? "—" : assignedComplaints}
              </p>
            </div>


            {/* In Progress */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                In Progress
              </p>

              <p className="mt-3 text-3xl font-bold text-purple-600">
                {loading ? "—" : inProgressComplaints}
              </p>
            </div>


            {/* Resolved */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Resolved
              </p>

              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {loading ? "—" : resolvedComplaints}
              </p>
            </div>

          </div>

        </div>


        {/* ================= RECENT COMPLAINTS ================= */}
        <div className="mb-10">

          <div className="mb-5 flex items-end justify-between">

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Recent Complaints
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest maintenance requests.
              </p>
            </div>

            {complaints.length > 0 && (
              <button
                onClick={() => navigate("/student/complaints")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All →
              </button>
            )}

          </div>


          {loading ? (

            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Loading your complaints...
            </div>

          ) : complaints.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl">
                🛠️
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                No complaints yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your reported maintenance issues will appear here.
              </p>

              <button
                onClick={() => navigate("/student/report")}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Report Your First Problem
              </button>

            </div>

          ) : (

            <div className="space-y-4">

              {complaints.slice(0, 5).map((complaint) => (

                <div
                  key={complaint._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                        🛠️
                      </div>

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {complaint.block} • Room {complaint.room}
                        </p>

                        <h3 className="mt-1 font-bold text-slate-800">
                          {complaint.category}
                        </h3>

                        <p className="mt-1 max-w-xl truncate text-sm text-slate-500">
                          {complaint.description}
                        </p>

                      </div>

                    </div>


                    <div className="flex items-center gap-3">

                      <span
                        className={`rounded-full px-4 py-1.5 text-xs font-bold ${getStatusStyle(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* ================= IMPACT CARD ================= */}
        <div className="mb-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
              🌱
            </div>

            <div>

              <h3 className="text-xl font-bold text-emerald-900">
                Your Campus Impact
              </h3>

              <p className="mt-1 text-sm leading-6 text-emerald-700">
                You have reported{" "}
                <strong>{totalComplaints}</strong>{" "}
                maintenance issue
                {totalComplaints !== 1 ? "s" : ""} and helped improve
                the campus.
              </p>

            </div>

          </div>

        </div>


        {/* ================= TIP ================= */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">

          <div className="flex gap-4">

            <div className="text-2xl">
              💡
            </div>

            <div>

              <h3 className="font-bold text-indigo-900">
                CampusFix Tip
              </h3>

              <p className="mt-2 text-sm leading-6 text-indigo-700">
                Add a clear description and, when possible, a photo of
                the issue. It helps the technician understand the problem
                and resolve it faster.
              </p>

            </div>

          </div>

        </div>

      </main>


      {/* ================= FOOTER ================= */}
      <footer className="mt-16 border-t border-slate-200 bg-white">

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
<LogoutModal
  isOpen={showLogout}
  onClose={() => setShowLogout(false)}
/>
    </div>
  );
}

export default StudentDashboard;
