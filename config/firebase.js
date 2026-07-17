const admin = require("firebase-admin");

let serviceAccount;

if (process.env.SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
    console.log(
      "Loaded Firebase service account from SERVICE_ACCOUNT_KEY env var",
    );
  } catch (err) {
    console.error("Failed to parse SERVICE_ACCOUNT_KEY:", err);
  }
} else {
  try {
    // Local file fallback for development only
    serviceAccount = require("../serviceAccountKey.json");
    console.log(
      "Loaded Firebase service account from ../serviceAccountKey.json",
    );
  } catch (err) {
    console.warn(
      "serviceAccountKey.json not found and SERVICE_ACCOUNT_KEY not set. Using application default credentials if available.",
    );
  }
}

if (!admin.apps.length) {
  const credential = serviceAccount
    ? admin.credential.cert(serviceAccount)
    : admin.credential.applicationDefault();

  admin.initializeApp({
    credential,
  });
}

module.exports = admin;
