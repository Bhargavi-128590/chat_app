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
  sendPush = true,
}) => {
  const notification = await Notification.create({
    receiver: recipient,

    sender,

    title,

    body,

    chat,

    message,
  });

  if (!recipient) {
    return notification;
  }

  const user = await User.findById(recipient);

  if (!sendPush || !user?.fcmToken) {
    return notification;
  }

  try {
    const pushResult = await sendFCM(
      user.fcmToken,

      title,

      body,

      {
        type: "MESSAGE",

        senderId: String(sender),

        chatId: String(chat),
      },
    );

    if (!pushResult?.success && pushResult?.reason === "invalid-token") {
      await User.findByIdAndUpdate(recipient, {
        $unset: { fcmToken: 1 },
      });
    }
  } catch (fcmError) {
    console.error("FCM push failed for user", recipient, fcmError);
  }

  return notification;
};

module.exports = {
  createNotification,
};
