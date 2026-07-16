const Notification = require("../models/Notification");

const User = require("../models/User");

const sendFCM = require("./sendFCM");

const createNotification = async ({
  recipient,

  sender,

  title,

  body,

  chat,

  message,
}) => {
  const notification = await Notification.create({
    receiver: recipient,

    sender,

    title,

    body,

    chat,

    message,
  });

  const user = await User.findById(recipient);

  if (user?.fcmToken) {
    await sendFCM(
      user.fcmToken,

      title,

      body,

      {
        type: "MESSAGE",

        senderId: String(sender),

        chatId: String(chat),
      },
    );
  }

  return notification;
};

module.exports = {
  createNotification,
};
