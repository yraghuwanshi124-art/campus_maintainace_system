import { useEffect, useState } from "react";
import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import LogoutModal from "../components/LogoutModal";

function AdminSettings() {
  const [showLogout, setShowLogout] = useState(false);
  const [admin, setAdmin] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setAdmin(JSON.parse(storedUser));
      } catch (error) {
        console.log("Invalid stored user");
      }
    }
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const token = localStorage.getItem("token");

      const response = await api.patch(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordMessage(
        response.data.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log(
        "CHANGE PASSWORD ERROR:",
        error.response?.data || error
      );

      setPasswordError(
        error.response?.data?.message ||
          "Unable to change password. Please try again."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitial = () => {
    if (admin?.name) {
      return admin.name.charAt(0).toUpperCase();
    }

    return "A";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar
        onLogout={() => setShowLogout(true)}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your administrator account and security
              </p>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">
                  {admin?.name || "Administrator"}
                </p>

                <p className="text-xs text-slate-400">
                  Administrator
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-sm font-black text-white shadow-sm">
                {getInitial()}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-6 p-6">
          {/* Profile Hero */}
          <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-lg">
            <div className="relative p-7 sm:p-9">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-white/5"></div>

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl font-black ring-1 ring-white/20">
                  {getInitial()}
                </div>

                <div>
                  <p className="text-sm font-semibold text-indigo-100">
                    Administrator Account
                  </p>

                  <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                    {admin?.name || "CampusFix Administrator"}
                  </h2>

                  <p className="mt-1 text-sm text-indigo-100">
                    {admin?.email || "Administrator account"}
                  </p>
                </div>

                <div className="sm:ml-auto">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold ring-1 ring-white/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                    Account Active
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Information */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                  👤
                </div>

                <div>
                  <h2 className="font-black text-slate-800">
                    Profile Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Basic information about your administrator account
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Full Name
                </p>

                <p className="mt-2 font-bold text-slate-800">
                  {admin?.name || "Administrator"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </p>

                <p className="mt-2 break-all font-bold text-slate-800">
                  {admin?.email || "Not available"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Account Role
                </p>

                <span className="mt-2 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  Administrator
                </span>
              </div>
            </div>
          </section>

          {/* Change Password */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
                  🔐
                </div>

                <div>
                  <h2 className="font-black text-slate-800">
                    Change Password
                  </h2>

                  <p className="text-sm text-slate-500">
                    Update your password to keep your account secure
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="p-6"
            >
              <div className="grid gap-5 lg:grid-cols-3">
                {/* Current Password */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Current Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          !showCurrentPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      {showCurrentPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(!showNewPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      {showNewPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Rules */}
              <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <p className="text-sm font-bold text-indigo-800">
                  Password requirements
                </p>

                <div className="mt-2 grid gap-2 text-xs text-indigo-700 sm:grid-cols-2">
                  <p>✓ At least 6 characters</p>
                  <p>✓ New password must be different</p>
                  <p>✓ Confirm password must match</p>
                  <p>✓ Current password must be correct</p>
                </div>
              </div>

              {/* Messages */}
              {passwordError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  ⚠️ {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">
                  ✓ {passwordMessage}
                </div>
              )}

              {/* Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          </section>

          {/* System Information */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg">
                  ⚙️
                </div>

                <div>
                  <h2 className="font-black text-slate-800">
                    System Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    CampusFix application information
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Application
                </p>

                <p className="mt-2 font-black text-slate-800">
                  CampusFix
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Campus Maintenance Management
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Version
                </p>

                <p className="mt-2 font-black text-slate-800">
                  1.0.0
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Production Release
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  System Status
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>

                  <span className="font-black text-emerald-600">
                    Operational
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  All services are running
                </p>
              </div>
            </div>
          </section>

          {/* Logout */}
          <section className="rounded-3xl border border-red-100 bg-white shadow-sm">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-lg">
                  🚪
                </div>

                <div>
                  <h2 className="font-black text-slate-800">
                    Sign Out
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Sign out from your CampusFix administrator account
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLogout(true)}
                className="rounded-xl bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </section>
        </main>
      </div>

      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
      />
    </div>
  );
}

export default AdminSettings;