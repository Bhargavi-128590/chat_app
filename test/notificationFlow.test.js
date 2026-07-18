const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeFcmToken,
  isValidFcmToken,
  isInvalidTokenError,
} = require("../services/sendFCM");

test("normalizeFcmToken trims whitespace and preserves valid values", () => {
  assert.equal(normalizeFcmToken("  abc123  "), "abc123");
  assert.equal(normalizeFcmToken(null), "");
  assert.equal(normalizeFcmToken("   "), "");
});

test("invalid FCM tokens are rejected", () => {
  assert.equal(isValidFcmToken(""), false);
  assert.equal(isValidFcmToken("   "), false);
  assert.equal(isValidFcmToken("abc"), false);
  assert.equal(isValidFcmToken("valid-token-123"), true);
});

test("invalid registration token errors are detected", () => {
  assert.equal(
    isInvalidTokenError({
      errorInfo: { code: "messaging/invalid-registration-token" },
    }),
    true,
  );
  assert.equal(
    isInvalidTokenError({
      code: "messaging/registration-token-not-registered",
    }),
    true,
  );
  assert.equal(isInvalidTokenError(new Error("boom")), false);
});
