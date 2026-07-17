const admin = require("../config/firebase");

const sendFCM = async (
  token,

  title,

  body,

  data = {},
) => {
  try {
    const message = {
      token,

      notification: {
        title,

        body,
      },

      data,

      android: {
        priority: "high",
      },

      apns: {
        headers: {
          "apns-priority": "10",
        },
      },
    };

    const response = await admin.messaging().send(message);

    if (process.env.NODE_ENV === "development") {
      console.log("FCM response:", response);
    }

    return response;
  } catch (err) {
    console.error("sendFCM error:", err);
    return null;
  }
};

module.exports = sendFCM;
