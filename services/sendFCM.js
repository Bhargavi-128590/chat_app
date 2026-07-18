const admin = require("../config/firebase");

const normalizeFcmToken = (token) => {
  if (typeof token !== "string") {
    return "";
  }

  return token.trim();
};

const isValidFcmToken = (token) => {
  const normalizedToken = normalizeFcmToken(token);

  return Boolean(normalizedToken && normalizedToken.length > 10);
};

const isInvalidTokenError = (error) => {
  const code = error?.errorInfo?.code || error?.code || "";

  return [
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
    "messaging/invalid-argument",
  ].includes(code);
};

const sendFCM = async (token, title, body, data = {}) => {
  const normalizedToken = normalizeFcmToken(token);

  if (!isValidFcmToken(normalizedToken)) {
    return {
      success: false,
      skipped: true,
      reason: "invalid-token",
    };
  }

  try {
    const message = {
      token: normalizedToken,
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

    return {
      success: true,
      response,
    };
  } catch (err) {
    if (isInvalidTokenError(err)) {
      console.warn("FCM token is invalid or expired:", normalizedToken);
      return {
        success: false,
        skipped: true,
        reason: "invalid-token",
      };
    }

    console.error("sendFCM error:", err);
    return {
      success: false,
      skipped: false,
      reason: "delivery-failed",
    };
  }
};

module.exports = sendFCM;
module.exports.normalizeFcmToken = normalizeFcmToken;
module.exports.isValidFcmToken = isValidFcmToken;
module.exports.isInvalidTokenError = isInvalidTokenError;
