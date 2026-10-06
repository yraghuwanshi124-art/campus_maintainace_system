const Notification = require("../models/Notification");

// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
    })
      .populate(
        "complaint",
        "block floor room category priority status"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      notifications,
    });
  } catch (error) {
    console.error(
      "GET MY NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================

const markNotificationAsRead = async (req, res) => {
  try {
    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          recipient: req.user.userId,
        },
        {
          isRead: true,
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    return res.json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error(
      "MARK NOTIFICATION READ ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to update notification.",
      error: error.message,
    });
  }
};

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.userId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    return res.json({
      message:
        "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "MARK ALL NOTIFICATIONS READ ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update notifications.",
      error: error.message,
    });
  }
};
// =====================================================
// DELETE ONE NOTIFICATION
// =====================================================

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    return res.json({
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE NOTIFICATION ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete notification.",
      error: error.message,
    });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
