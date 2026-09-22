
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ComplaintForm() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    block: "",
    room: "",
    category: "",
    description: "",
    priority: "Medium",
  });

  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Duplicate complaint states
  const [duplicateComplaint, setDuplicateComplaint] = useState(null);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [alreadySupported, setAlreadySupported] = useState(false);
  const [supporting, setSupporting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      block: "",
      room: "",
      category: "",
      description: "",
      priority: "Medium",
    });

    setImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.block.trim()) {
      alert("Please enter the block.");
      return;
    }

    if (!formData.room.trim()) {
      alert("Please enter the room number.");
      return;
    }

    if (!formData.category) {
      alert("Please select a problem category.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please describe the problem.");
      return;
    }

    if (!image) {
      alert("Please upload a photo of the problem.");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      let imageUrl = "";

      // Upload image to Cloudinary
      const uploadData = new FormData();

      uploadData.append("file", image);
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

      imageUrl = cloudinaryData.secure_url;

      // Submit complaint
      const response = await api.post(
        "/complaints",
        {
          ...formData,
          image: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      resetForm();

      navigate("/student/complaints");
    } catch (error) {
      // Duplicate complaint found
      if (
        error.response?.status === 409 &&
        error.response?.data?.duplicate
      ) {
        const duplicateData = error.response.data;

        setDuplicateComplaint(duplicateData.complaint);
        setDuplicateMessage(
          duplicateData.message ||
            "A similar active complaint already exists."
        );
        setAlreadySupported(
          duplicateData.alreadySupported || false
        );

        return;
      }

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit complaint"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Support existing complaint
  const handleSupportComplaint = async () => {
    if (!duplicateComplaint?._id) {
      return;
    }

    try {
      setSupporting(true);

      const token = localStorage.getItem("token");

      const response = await api.post(
        `/complaints/${duplicateComplaint._id}/support`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      setDuplicateComplaint(null);
      setDuplicateMessage("");
      setAlreadySupported(false);

      resetForm();

      navigate("/student/complaints");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to support complaint"
      );
    } finally {
      setSupporting(false);
    }
  };

  const closeDuplicateModal = () => {
    setDuplicateComplaint(null);
    setDuplicateMessage("");
    setAlreadySupported(false);
  };

  const supporterCount =
    duplicateComplaint?.supporters?.length || 0;

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

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate("/student")}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-100"
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
            🛠️ Maintenance Request
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            Report a Problem
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
            Found a maintenance issue on campus? Provide the details
            below and our maintenance team will take care of it.
          </p>
        </div>

        {/* ================= FORM CARD ================= */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-6 text-white sm:px-8">
            <h2 className="text-xl font-bold">
              Complaint Details
            </h2>

            <p className="mt-1 text-sm text-indigo-100">
              Please provide accurate information about the issue.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-7 p-6 sm:p-8"
          >
            {/* Student Information */}
            <div className="mb-7 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                  👤
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Student Information
                  </h3>

                  <p className="text-xs text-slate-500">
                    Details from your account
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-600">
                    Name
                  </label>

                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    {user?.name || "N/A"}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-600">
                    Email
                  </label>

                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    {user?.email || "N/A"}
                  </div>
                </div>

                {/* Class / Section */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-600">
                    Class / Section
                  </label>

                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    {user?.classSection || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= LOCATION ================= */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                  📍
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Location
                  </h3>

                  <p className="text-xs text-slate-400">
                    Where is the problem located?
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Block */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Block
                  </label>

                  <input
                    name="block"
                    placeholder="e.g. V Block"
                    value={formData.block}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {/* Room */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Room Number
                  </label>

                  <input
                    name="room"
                    placeholder="e.g. 304"
                    value={formData.room}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100"></div>

            {/* ================= PROBLEM ================= */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-lg">
                  🔧
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Problem Information
                  </h3>

                  <p className="text-sm text-slate-400">
                    Tell us what needs to be fixed.
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Problem Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">
                    Select problem category
                  </option>
                  <option value="Fan">Fan</option>
                  <option value="Light">Light</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Projector">Projector</option>
                  <option value="Computer">Computer</option>
                  <option value="AC">AC</option>
                  <option value="Door">Door</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Describe the Problem
                </label>

                <textarea
                  name="description"
                  placeholder="Explain the problem clearly. For example: The projector is turning on but no display is visible..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                  className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />

                <p className="mt-2 text-s text-slate-400">
                  💡 A clear description helps the technician understand
                  the issue faster.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100"></div>

            {/* ================= PHOTO ================= */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-lg">
                  📷
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Problem Photo
                  </h3>

                  <p className="text-sm text-slate-400">
                    Add a photo to help identify the issue.
                  </p>
                </div>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
                <div className="text-4xl">📸</div>

                <p className="mt-3 font-semibold text-slate-700">
                  {image
                    ? image.name
                    : "Click to upload a photo"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  JPG, PNG or WebP
                </p>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    setImage(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100"></div>

            {/* ================= PRIORITY ================= */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-lg">
                  ⚡
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Priority
                  </h3>

                  <p className="text-s text-slate-400">
                    How urgent is this problem?
                  </p>
                </div>
              </div>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="Low">
                  Low — Can be fixed later
                </option>

                <option value="Medium">
                  Medium — Needs attention
                </option>

                <option value="High">
                  High — Requires urgent attention
                </option>
              </select>
            </div>

            {/* ================= SUBMIT ================= */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-800 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting Complaint..."
                  : "🚀 Submit Complaint"}
              </button>

              <p className="mt-3 text-center text-xs text-slate-400">
                Please verify the location and problem details before
                submitting.
              </p>
            </div>
          </form>
        </div>

        {/* ================= INFO ================= */}
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex gap-3">
            <span className="text-xl">💡</span>

            <div>
              <p className="text-sm font-bold text-indigo-900">
                Faster Resolution Tip
              </p>

              <p className="mt-1 text-sm leading-6 text-indigo-700">
                Uploading a clear photo and providing the exact room
                number can help the maintenance team resolve your
                complaint faster.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-7">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-bold text-slate-800">
                CampusFix
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Medi-Caps University
              </p>
            </div>

            <p className="text-xs text-slate-400">
              Smart Campus • Faster Resolution • Better Management
            </p>
          </div>
        </div>
      </footer>

      {/* ================= DUPLICATE COMPLAINT MODAL ================= */}
      {duplicateComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl">
                    ⚠️
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800">
                      Similar Complaint Found
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {duplicateMessage}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDuplicateModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Existing Complaint */}
            <div className="space-y-5 px-6 py-6 sm:px-7">
              {/* Location */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Existing Complaint
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 font-bold text-slate-700">
                      {duplicateComplaint.block}
                      {duplicateComplaint.room
                        ? ` • Room ${duplicateComplaint.room}`
                        : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Category
                    </p>

                    <p className="mt-1 font-bold text-slate-700">
                      {duplicateComplaint.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Status
                    </p>

                    <span className="mt-1 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                      {duplicateComplaint.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Priority
                    </p>

                    <p className="mt-1 font-bold text-slate-700">
                      {duplicateComplaint.priority || "Medium"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Problem Description
                </p>

                <p className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                  {duplicateComplaint.description}
                </p>
              </div>

              {/* Original Reporter */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-400">
                  Reported By
                </p>

                <p className="mt-1 font-bold text-indigo-900">
                  {duplicateComplaint.user?.name || "Student"}
                </p>

                {duplicateComplaint.user?.classSection && (
                  <p className="mt-1 text-xs text-indigo-600">
                    {duplicateComplaint.user.classSection}
                  </p>
                )}
              </div>

              {/* Support Count */}
              <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    Students affected
                  </p>

                  <p className="mt-1 text-xs text-emerald-700">
                    Supporting this complaint helps the admin see
                    how many students are affected.
                  </p>
                </div>

                <div className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-extrabold text-emerald-700">
                  {supporterCount + 1}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {!alreadySupported ? (
                  <button
                    type="button"
                    onClick={handleSupportComplaint}
                    disabled={supporting}
                    className="w-full rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {supporting
                      ? "Adding Your Support..."
                      : "👍 Support This Complaint"}
                  </button>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-center text-sm font-bold text-emerald-700">
                    ✓ You have already supported this complaint
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeDuplicateModal}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              <p className="text-center text-xs leading-5 text-slate-400">
                You do not need to submit another complaint for the
                same issue. Supporting the existing complaint keeps
                the maintenance request organized.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintForm;
