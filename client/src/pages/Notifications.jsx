
import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  Trash2,
  ArrowLeft,
  ExternalLink,
  FileText,
  AlertCircle,
  Search,
  Check,
  MailOpen,
  Inbox,
  Sparkles,
} from "lucide-react";
import SupervisorSidebar from "../components/SupervisorSidebar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Notifications = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedNotification, setSelectedNotification] =
    useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // =========================================================
  // FETCH NOTIFICATIONS
  // =========================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error(
        "FAILED TO FETCH NOTIFICATIONS:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // =========================================================
  // COUNTS
  // =========================================================

  const totalCount = notifications.length;

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const readCount = notifications.filter(
    (notification) => notification.isRead
  ).length;

  // =========================================================
  // GET COMPLAINT ID
  // =========================================================

  const getComplaintId = (notification) => {
    return (
      notification?.complaintId ||
      notification?.complaint?._id ||
      notification?.data?.complaintId ||
      notification?.metadata?.complaintId ||
      null
    );
  };

  // =========================================================
  // FILTER NOTIFICATIONS
  // =========================================================

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (activeFilter === "unread") {
      result = result.filter(
        (notification) => !notification.isRead
      );
    }

    if (activeFilter === "read") {
      result = result.filter(
        (notification) => notification.isRead
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      result = result.filter((notification) => {
        const title =
          notification.title?.toLowerCase() || "";

        const message =
          notification.message?.toLowerCase() || "";

        return (
          title.includes(query) ||
          message.includes(query)
        );
      });
    }

    return result;
  }, [
    notifications,
    activeFilter,
    searchQuery,
  ]);

  // =========================================================
  // MARK NOTIFICATION AS READ
  // =========================================================

  const markAsRead = async (notification) => {
    if (!notification || notification.isRead) {
      return;
    }

    try {
      await api.patch(
        `/notifications/${notification._id}/read`
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      setSelectedNotification((previous) =>
        previous?._id === notification._id
          ? {
              ...previous,
              isRead: true,
            }
          : previous
      );
    } catch (error) {
      console.error(
        "FAILED TO MARK NOTIFICATION AS READ:",
        error
      );
    }
  };

  // =========================================================
  // OPEN NOTIFICATION
  // =========================================================

  const handleOpenNotification = async (
    notification
  ) => {
    setSelectedNotification(notification);

    await markAsRead(notification);
  };

  // =========================================================
  // DELETE NOTIFICATION
  // =========================================================

  const handleDeleteNotification = async (
    event,
    notificationId
  ) => {
    event.stopPropagation();

    try {
      setDeletingId(notificationId);

      await api.delete(
        `/notifications/${notificationId}`
      );

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification._id !== notificationId
        )
      );

      setSelectedNotification((previous) =>
        previous?._id === notificationId
          ? null
          : previous
      );
    } catch (error) {
      console.error(
        "FAILED TO DELETE NOTIFICATION:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete notification."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // DELETE ALL
  // =========================================================

  const handleDeleteAll = async () => {
    if (notifications.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete all notifications?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAll(true);

      await api.delete("/notifications");

      setNotifications([]);
      setSelectedNotification(null);
    } catch (error) {
      console.error(
        "FAILED TO DELETE ALL NOTIFICATIONS:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete all notifications."
      );
    } finally {
      setDeletingAll(false);
    }
  };

  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setSelectedNotification((previous) =>
        previous
          ? {
              ...previous,
              isRead: true,
            }
          : previous
      );
    } catch (error) {
      console.error(
        "FAILED TO MARK ALL NOTIFICATIONS AS READ:",
        error
      );
    }
  };

  // =========================================================
  // OPEN RELATED COMPLAINT
  // =========================================================

  const handleViewComplaint = () => {
    const complaintId = getComplaintId(
      selectedNotification
    );

    if (!complaintId) {
      return;
    }

    navigate("/supervisor/complaints", {
      state: {
        complaintId,
      },
    });
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDateTime = (date) => {
    if (!date) {
      return "Date not available";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =========================================================
  // FILTER BUTTON
  // =========================================================

  const filterButtons = [
    {
      id: "all",
      label: "All",
      count: totalCount,
      icon: Inbox,
    },
    {
      id: "unread",
      label: "Unread",
      count: unreadCount,
      icon: Bell,
    },
    {
      id: "read",
      label: "Read",
      count: readCount,
      icon: CheckCheck,
    },
  ];

  // =========================================================
  // DETAIL VIEW
  // =========================================================

  if (selectedNotification) {
    const complaintId = getComplaintId(
      selectedNotification
    );

    return (
      <div className="min-h-screen bg-slate-50">
        <SupervisorSidebar onLogout={handleLogout} />

        <main className="min-h-screen p-4 sm:p-6 lg:ml-64">
          <div className="mx-auto max-w-4xl">

            {/* TOP ACTIONS */}

            <div className="mb-6 flex items-center justify-between gap-4">

              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(null)
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                onClick={(event) =>
                  handleDeleteNotification(
                    event,
                    selectedNotification._id
                  )
                }
                disabled={
                  deletingId ===
                  selectedNotification._id
                }
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={17} />

                {deletingId ===
                selectedNotification._id
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>

            {/* DETAIL CARD */}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* HERO */}

              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                    <Bell size={27} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                        Notification
                      </span>

                      {selectedNotification.isRead ? (
                        <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100">
                          Read
                        </span>
                      ) : (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700">
                          New
                        </span>
                      )}

                    </div>

                    <h1 className="mt-4 text-2xl font-black sm:text-3xl">
                      {selectedNotification.title ||
                        "CampusFix Notification"}
                    </h1>

                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-100">
                      <Clock size={16} />
                      {formatDateTime(
                        selectedNotification.createdAt
                      )}
                    </div>

                  </div>

                </div>

              </div>

              {/* BODY */}

              <div className="p-5 sm:p-8">

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <div className="flex items-center gap-2">

                    <FileText
                      size={18}
                      className="text-blue-600"
                    />

                    <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
                      Notification Details
                    </h2>

                  </div>

                  <p className="mt-4 text-base leading-7 text-slate-700">
                    {selectedNotification.message ||
                      "No additional message available."}
                  </p>

                </div>

                {/* INFORMATION */}

                <div className="mt-4 grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">

                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Received
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {formatDateTime(
                        selectedNotification.createdAt
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">

                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-800">

                      {selectedNotification.isRead ? (
                        <>
                          <CheckCheck
                            size={17}
                            className="text-emerald-600"
                          />
                          Read
                        </>
                      ) : (
                        <>
                          <Bell
                            size={17}
                            className="text-blue-600"
                          />
                          Unread
                        </>
                      )}

                    </p>

                  </div>

                </div>

                {/* RELATED COMPLAINT */}

                {complaintId ? (
                  <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <FileText size={19} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <h2 className="text-base font-black text-blue-900">
                          Related Complaint
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-blue-700">
                          This notification is connected
                          to a CampusFix maintenance
                          complaint.
                        </p>

                        <p className="mt-2 break-all text-xs font-bold text-blue-800">
                          Complaint ID: {complaintId}
                        </p>

                        <button
                          type="button"
                          onClick={
                            handleViewComplaint
                          }
                          className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                        >
                          View Related Complaint
                          <ExternalLink size={16} />
                        </button>

                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                    <div className="flex items-start gap-3">

                      <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div>

                        <p className="text-sm font-bold text-slate-700">
                          No related complaint
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          This notification is not linked
                          to a specific complaint.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // NOTIFICATION LIST
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <SupervisorSidebar onLogout={handleLogout} />

      <main className="min-h-screen p-4 sm:p-6 lg:ml-64">

        <div className="mx-auto max-w-6xl">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg sm:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <Bell size={25} />
                  </div>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                    Supervisor Center
                  </span>

                </div>

                <h1 className="text-3xl font-black sm:text-4xl">
                  Notifications
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                  Stay updated with complaint assignments,
                  technician activity and CampusFix events.
                </p>

              </div>

              <div className="hidden h-28 w-28 items-center justify-center rounded-full bg-white/10 lg:flex">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">

                  <Sparkles
                    size={35}
                    className="text-white"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* ALL */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Total Notifications
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {totalCount}
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Inbox size={23} />
                </div>

              </div>

            </div>

            {/* UNREAD */}

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                    Unread
                  </p>

                  <p className="mt-2 text-3xl font-black text-blue-700">
                    {unreadCount}
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Bell size={23} />
                </div>

              </div>

            </div>

            {/* READ */}

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                    Read
                  </p>

                  <p className="mt-2 text-3xl font-black text-emerald-700">
                    {readCount}
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <CheckCheck size={23} />
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FILTER + SEARCH
          ================================================= */}

          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* FILTERS */}

              <div className="flex flex-wrap gap-2">

                {filterButtons.map((filter) => {

                  const Icon = filter.icon;

                  const isActive =
                    activeFilter === filter.id;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() =>
                        setActiveFilter(filter.id)
                      }
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Icon size={16} />

                      {filter.label}

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white text-slate-500"
                        }`}
                      >
                        {filter.count}
                      </span>
                    </button>
                  );
                })}

              </div>

              {/* SEARCH */}

              <div className="relative w-full lg:max-w-sm">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search notifications..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              ACTION BAR
          ================================================= */}

          {(unreadCount > 0 ||
            notifications.length > 0) && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

              <p className="text-sm font-semibold text-slate-500">

                Showing{" "}

                <span className="font-black text-slate-800">
                  {filteredNotifications.length}
                </span>

                {" "}of{" "}

                <span className="font-black text-slate-800">
                  {totalCount}
                </span>

                {" "}notifications

              </p>

              <div className="flex flex-wrap gap-2">

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                  >
                    <Check size={15} />
                    Mark All Read
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteAll}
                    disabled={deletingAll}
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={15} />

                    {deletingAll
                      ? "Deleting..."
                      : "Delete All"}
                  </button>
                )}

              </div>

            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">

                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              </div>

              <p className="mt-4 text-sm font-bold text-slate-500">
                Loading notifications...
              </p>

            </div>
          )}

          {/* =================================================
              NO RESULTS
          ================================================= */}

          {!loading &&
            filteredNotifications.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">

                  {searchQuery ? (
                    <Search
                      size={35}
                      className="text-slate-400"
                    />
                  ) : activeFilter === "unread" ? (
                    <MailOpen
                      size={35}
                      className="text-slate-400"
                    />
                  ) : (
                    <Bell
                      size={35}
                      className="text-slate-400"
                    />
                  )}

                </div>

                <h2 className="mt-5 text-xl font-black text-slate-700">

                  {searchQuery
                    ? "No notifications found"
                    : activeFilter === "unread"
                    ? "No unread notifications"
                    : activeFilter === "read"
                    ? "No read notifications"
                    : "No notifications"}

                </h2>

                <p className="mt-2 text-sm text-slate-400">

                  {searchQuery
                    ? "Try searching with a different keyword."
                    : "You're all caught up."}

                </p>

                {(searchQuery ||
                  activeFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("all");
                    }}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Show All Notifications
                  </button>
                )}

              </div>
            )}

          {/* =================================================
              NOTIFICATION LIST
          ================================================= */}

          {!loading &&
            filteredNotifications.length > 0 && (
              <div className="space-y-3">

                {filteredNotifications.map(
                  (notification) => {

                    const complaintId =
                      getComplaintId(
                        notification
                      );

                    return (
                      <div
                        key={notification._id}
                        onClick={() =>
                          handleOpenNotification(
                            notification
                          )
                        }
                        className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                          notification.isRead
                            ? "border-slate-200 bg-white"
                            : "border-blue-200 bg-blue-50/70"
                        }`}
                      >

                        {/* UNREAD INDICATOR */}

                        {!notification.isRead && (
                          <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
                        )}

                        <div className="flex gap-4">

                          {/* ICON */}

                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                              notification.isRead
                                ? "bg-slate-100 text-slate-500"
                                : "bg-blue-600 text-white shadow-md"
                            }`}
                          >
                            {notification.isRead ? (
                              <CheckCheck size={21} />
                            ) : (
                              <Bell size={21} />
                            )}
                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0 flex-1">

                                <div className="flex flex-wrap items-center gap-2">

                                  <h3 className="text-base font-black text-slate-900">
                                    {notification.title ||
                                      "CampusFix Notification"}
                                  </h3>

                                  {!notification.isRead && (
                                    <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black tracking-wide text-white">
                                      UNREAD
                                    </span>
                                  )}

                                </div>

                                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600">
                                  {notification.message ||
                                    "No message available."}
                                </p>

                              </div>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={(event) =>
                                  handleDeleteNotification(
                                    event,
                                    notification._id
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  notification._id
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete notification"
                                aria-label="Delete notification"
                              >
                                <Trash2 size={17} />
                              </button>

                            </div>

                            {/* META */}

                            <div className="mt-4 flex flex-wrap items-center gap-2">

                              <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
                                <Clock size={13} />
                                {formatDateTime(
                                  notification.createdAt
                                )}
                              </span>

                              {complaintId && (
                                <span className="flex items-center gap-1.5 rounded-lg bg-blue-100 px-2.5 py-1.5 text-xs font-bold text-blue-700">
                                  <FileText size={13} />
                                  Related Complaint
                                </span>
                              )}

                              <span className="ml-auto flex items-center gap-1 text-xs font-black text-blue-600 opacity-0 transition group-hover:opacity-100">
                                View Details
                                <ExternalLink
                                  size={13}
                                />
                              </span>

                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

        </div>
      </main>
    </div>
  );
};

export default Notifications;
