
const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  title,
  message,
  type = "system",
  complaint = null,
}) => {
  try {
    if (!recipient) {
      return null;
    }

    const notification =
      await Notification.create({
        recipient,
        title,
        message,
        type,
        complaint,
      });

    return notification;
  } catch (error) {
    console.error(
      "CREATE NOTIFICATION ERROR:",
      error
    );

    // Notification failure should not break
    // the main complaint workflow.
    return null;
  }
};

module.exports = {
  createNotification,
};
