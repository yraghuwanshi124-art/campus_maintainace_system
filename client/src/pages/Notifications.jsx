
import React, { useEffect, useState } from "react";
import { Bell, CheckCheck, Clock } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";



const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");

      setNotifications(
        response.data.notifications || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Bell size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Notifications
                </h1>

                <p className="text-sm text-slate-500">
                  Stay updated with your CampusFix activities
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {unreadCount} Unread
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading notifications...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && notifications.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <Bell
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />

            <h2 className="text-lg font-semibold text-slate-700">
              No notifications
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              You're all caught up.
            </p>
          </div>
        )}

        {/* Notifications */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
<div
  key={notification._id}
  onClick={() => {
    markAsRead(notification._id);
  }}
  className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition ${
    notification.isRead
      ? "border-slate-200 bg-white"
      : "border-blue-200 bg-blue-50"
  }`}
>
                <div className="flex gap-4">

                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      notification.isRead
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {notification.isRead ? (
                      <CheckCheck size={20} />
                    ) : (
                      <Bell size={20} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {notification.title}
                      </h3>

                      {!notification.isRead && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={14} />

                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

const markAsRead = async (notificationId) => {
  try {
    await api.patch(
      `/notifications/${notificationId}/read`
    );

    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === notificationId
          ? {
              ...notification,
              isRead: true,
            }
          : notification
      )
    );
  } catch (error) {
    console.error(
      "Failed to mark notification as read:",
      error
    );
  }
};


const markAllAsRead = async () => {
  try {
    await api.patch("/notifications/read-all");

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  } catch (error) {
    console.error(
      "Failed to mark all notifications as read:",
      error
    );
  }
};


export default Notifications;
