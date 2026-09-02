
import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/complaints/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComplaints(response.data.complaints);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Delete complaint
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

  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }

    if (status === "In Progress") {
      return "bg-purple-100 text-purple-700 border-purple-200";
    }

    if (status === "Assigned") {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }

    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-red-50 text-red-600";
    }

    if (priority === "Medium") {
      return "bg-orange-50 text-orange-600";
    }

    return "bg-emerald-50 text-emerald-600";
  };

  const resolvedCount = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  const activeCount = complaints.filter(
    (complaint) => complaint.status !== "Resolved"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= NAVBAR ================= */}
      <nav className="border-b border-indigo-100 bg-indigo-50 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Branding */}
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


          {/* Navbar Actions */}
          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/student")}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-100"
            >
              ← Dashboard
            </button>


          </div>

        </div>
      </nav>


      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-7xl px-6 py-10">


        {/* ================= HEADER ================= */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
              📋 Student Portal
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
              My Complaints
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Track the maintenance requests you have submitted
              and monitor their progress.
            </p>

          </div>


          <button
            onClick={() => navigate("/student/report")}
            className="w-fit rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-800 hover:shadow-lg"
          >
            + New Complaint
          </button>

        </div>


        {/* ================= STATS ================= */}
        <div className="mb-10 grid gap-5 sm:grid-cols-3">

          {/* Total */}
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Total Complaints
                </p>

                <p className="mt-2 text-3xl font-extrabold text-indigo-600">
                  {complaints.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                📋
              </div>

            </div>

          </div>


          {/* Active */}
          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-slate-500">
                  Active
                </p>

                <p className="mt-2 text-3xl font-extrabold text-orange-600">
                  {activeCount}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                🔧
              </div>

            </div>

          </div>


          {/* Resolved */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-slate-500">
                  Resolved
                </p>

                <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                  {resolvedCount}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                ✓
              </div>

            </div>

          </div>

        </div>


        {/* ================= COMPLAINTS ================= */}
        {complaints.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-indigo-200 bg-white p-14 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-4xl">
              📋
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-800">
              No complaints yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't submitted any maintenance complaints.
              If you find an issue on campus, report it here.
            </p>

            <button
              onClick={() => navigate("/student/report")}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              🛠️ Report a Problem
            </button>

          </div>

        ) : (

          <div className="space-y-6">

            {complaints.map((complaint, index) => (

              <div
                key={complaint._id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
              >

                {/* ================= CARD HEADER ================= */}
                <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-5 sm:p-6">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-md">
                        🛠️
                      </div>

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                          Complaint #{index + 1}
                        </p>

                        <h3 className="mt-1 text-xl font-extrabold text-slate-800">
                          {complaint.category}
                        </h3>

                      </div>

                    </div>


                    <span
                      className={`w-fit rounded-full border px-4 py-2 text-xs font-extrabold ${getStatusStyle(
                        complaint.status
                      )}`}
                    >
                      {complaint.status === "Resolved" && "✓ "}
                      {complaint.status}
                    </span>

                  </div>

                </div>


                {/* ================= DETAILS ================= */}
                <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-3">

                  {/* Location */}
                  <div className="rounded-2xl bg-slate-50 p-5 transition group-hover:bg-indigo-50/40">

                    <div className="flex items-center gap-2">

                      <span className="text-lg">
                        📍
                      </span>

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Location
                      </p>

                    </div>

                    <p className="mt-3 font-bold text-slate-700">
                      {complaint.block}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Room {complaint.room}
                    </p>

                  </div>


                  {/* Priority */}
                  <div className="rounded-2xl bg-slate-50 p-5 transition group-hover:bg-orange-50/40">

                    <div className="flex items-center gap-2">

                      <span className="text-lg">
                        ⚡
                      </span>

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Priority
                      </p>

                    </div>

                    <p
                      className={`mt-3 w-fit rounded-lg px-3 py-1.5 text-sm font-extrabold ${getPriorityStyle(
                        complaint.priority
                      )}`}
                    >
                      {complaint.priority}
                    </p>

                  </div>


                  {/* Status */}
                  <div className="rounded-2xl bg-slate-50 p-5 transition group-hover:bg-emerald-50/40">

                    <div className="flex items-center gap-2">

                      <span className="text-lg">
                        📊
                      </span>

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Current Status
                      </p>

                    </div>

                    <p className="mt-3 font-bold text-slate-700">
                      {complaint.status}
                    </p>

                  </div>

                </div>


                {/* ================= DESCRIPTION ================= */}
                <div className="mx-5 mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:mx-6">

                  <div className="flex items-center gap-2">

                    <span>
                      📝
                    </span>

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Problem Description
                    </p>

                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {complaint.description}
                  </p>

                </div>


                {/* ================= PROBLEM IMAGE ================= */}
                {complaint.image && (

                  <div className="mx-5 mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:mx-6">

                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      📷 Problem Photo
                    </p>

                    <img
                      src={complaint.image}
                      alt="Reported problem"
                      className="h-64 w-full rounded-xl object-cover shadow-sm sm:w-96"
                    />

                  </div>

                )}


                {/* ================= ACTION ================= */}
                <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-sm font-bold text-slate-700">
                        Complaint Management
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Keep track of your maintenance request.
                      </p>

                    </div>


                    <button
                      onClick={() =>
                        deleteComplaint(complaint._id)
                      }
                      className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md"
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


      {/* ================= FOOTER ================= */}
      <footer className="mt-12 border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8">

          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">

            <div>

              <p className="text-lg font-extrabold text-indigo-700">
                CampusFix
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Medi-Caps University
              </p>

            </div>

            <div>

              <p className="text-xs text-slate-400">
                Smart Campus • Faster Resolution • Better Management
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Campus Maintenance Management System
              </p>

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default MyComplaints;
