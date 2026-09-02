
import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutModal from "../components/LogoutModal";


function TechnicianDashboard() {
  const [complaints, setComplaints] = useState([]);
    const [showLogout, setShowLogout] = useState(false);
  

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/complaints/assigned", {
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
  const handleCompletionPhoto = async (complaintId, file) => {
    try {
      const token = localStorage.getItem("token");

      // Upload photo to Cloudinary
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

      // Save image URL in database
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

      // Update UI immediately
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
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
    }
  };
  // Update status
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

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId
            ? { ...complaint, status }
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

  // Delete resolved complaint
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

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "text-red-600";
    }

    if (priority === "Medium") {
      return "text-orange-600";
    }

    return "text-emerald-600";
  };

  const totalComplaints = complaints.length;

  const inProgressComplaints = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">

          <div>
            <div className="mb-6">
              <img
                src="https://www.medicaps.ac.in/public/frontend/images/medicaps-logo-fin.webp"
                alt="Medi-Caps University"
                className="h-15 w-70"
              />
            </div>

            <p className="text-xs text-slate-400">
              Technician Panel
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-700">
                Technician
              </p>

              <p className="text-xs text-slate-400">
                Maintenance Team
              </p>
            </div>

<button
  onClick={() => setShowLogout(true)}
  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
>
  Logout
</button>

          </div>

        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="mb-8">

          <p className="text-sm font-semibold text-indigo-600">
            Maintenance Team
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            Technician Dashboard
          </h2>

          <p className="mt-2 text-slate-500">
            View assigned maintenance complaints and manage their progress.
          </p>

        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-5 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Assigned
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-800">
              {totalComplaints}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              In Progress
            </p>

            <p className="mt-3 text-3xl font-bold text-purple-600">
              {inProgressComplaints}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Resolved
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {resolvedComplaints}
            </p>
          </div>

        </div>

        {/* Heading */}
        <div className="mb-6">

          <h3 className="text-2xl font-bold text-slate-800">
            My Assigned Work
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Complaints assigned to you by the administrator.
          </p>

        </div>

        {/* Empty */}
        {complaints.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
              🔧
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-800">
              No complaints assigned
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              You don't have any maintenance complaints assigned yet.
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {complaints.map((complaint) => (

              <div
                key={complaint._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >

                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                      🛠️
                    </div>

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Maintenance Request
                      </p>

                      <h4 className="text-lg font-bold text-slate-800">
                        {complaint.category}
                      </h4>

                    </div>

                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-1.5 text-xs font-bold ${getStatusStyle(
                      complaint.status
                    )}`}
                  >
                    {complaint.status}
                  </span>

                </div>

                {/* Details */}
                <div className="grid gap-5 p-5 md:grid-cols-3">

                  {/* Location */}
                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Location
                    </p>

                    <p className="mt-2 font-semibold text-slate-700">
                      📍 {complaint.block}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Room {complaint.room}
                    </p>

                  </div>

                  {/* Student */}
                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Reported By
                    </p>

                    <p className="mt-2 font-semibold text-slate-700">
                      {complaint.user?.name || "Unknown"}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {complaint.user?.email || "No email"}
                    </p>

                  </div>

                  {/* Priority */}
                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Priority
                    </p>

                    <p
                      className={`mt-2 font-bold ${getPriorityStyle(
                        complaint.priority
                      )}`}
                    >
                      {complaint.priority}
                    </p>

                  </div>

                </div>

                {/* Description */}
                <div className="mx-5 mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">

                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Problem Description
                  </p>

                  <p className="text-sm leading-6 text-slate-600">
                    {complaint.description}
                  </p>

                </div>
                {/* Problem Photo */}
                {complaint.image && (
                  <div className="mx-5 mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Problem Photo
                    </p>

                    <img
                      src={complaint.image}
                      alt="Problem"
                      className="h-64 w-full rounded-xl object-cover sm:w-96"
                    />

                  </div>

                )}

                {/* Completion Photo */}
                <div className="mx-5 mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">

                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Work Completion Photo
                  </p>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleCompletionPhoto(complaint._id, file);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                  />

                  <p className="mt-2 text-sm text-slate-400">
                    Upload a photo after completing the maintenance work.
                  </p>
                  {complaint.completionImage && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Uploaded Completion Photo
                      </p>

                      <img
                        src={complaint.completionImage}
                        alt="Work completed"
                        className="h-64 w-full rounded-xl object-cover sm:w-96"
                      />
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="border-t border-slate-100 bg-slate-50/70 p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* Status */}
                    <div>

                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Update Complaint Status
                      </p>

                      <select
                        value={complaint.status}
                        onChange={(e) =>
                          updateStatus(
                            complaint._id,
                            e.target.value
                          )
                        }
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >

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

                    {/* Delete */}
                    {complaint.status === "Resolved" && (

                      <button
                        onClick={() =>
                          deleteComplaint(complaint._id)
                        }
                        className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                      >
                        🗑️ Delete Complaint
                      </button>

                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>
      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
      />
    </div>
  );
}

export default TechnicianDashboard;
