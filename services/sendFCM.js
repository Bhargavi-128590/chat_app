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
    };

    const response = await admin.messaging().send(message);

    console.log(response);

    return response;
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendFCM;
