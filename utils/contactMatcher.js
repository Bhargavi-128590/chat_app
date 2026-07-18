const normalizePhone = (value) => {
  if (!value) return "";

  const cleaned = String(value).trim();

  if (!cleaned) return "";

  const digits = cleaned.replace(/\D/g, "");

  if (!digits) return "";

  return digits.length > 10 ? `+${digits}` : digits;
};

const parseContactsPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    if (typeof payload === "string") {
      const trimmed = payload.trim();

      if (!trimmed) {
        return [];
      }

      try {
        const parsed = JSON.parse(trimmed);
        return parseContactsPayload(parsed);
      } catch (error) {
        return [];
      }
    }

    return [];
  }

  const candidateKeys = [
    "contacts",
    "data",
    "items",
    "result",
    "users",
    "phoneNumbers",
  ];

  for (const key of candidateKeys) {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsedValue = parseContactsPayload(value);
      if (Array.isArray(parsedValue) && parsedValue.length > 0) {
        return parsedValue;
      }
    }
  }

  return [];
};

const extractContactsToMatch = (payload) => {
  const parsedPayload = parseContactsPayload(payload);

  return Array.isArray(parsedPayload) ? parsedPayload : [];
};

const mapContactsToUsers = (contacts = [], users = [], currentUserId) => {
  const userMap = new Map();

  users.forEach((user) => {
    if (user._id?.toString() === currentUserId?.toString()) {
      return;
    }

    const phoneKey = normalizePhone(user.phone);
    const emailKey = user.email?.toLowerCase();

    if (phoneKey) {
      // Index by full normalized number
      userMap.set(phoneKey, user);

      // Also index by last 10 digits to handle country code mismatches
      const last10 = phoneKey.replace(/\D/g, "").slice(-10);
      if (last10.length === 10) {
        userMap.set(last10, user);
      }
    }

    if (emailKey) {
      userMap.set(emailKey, user);
    }
  });

  return contacts.map((contact) => {
    const rawPhone = contact.phone ||
      contact.mobile ||
      contact.contactNumber ||
      contact.number ||
      "";
    const phoneKey = normalizePhone(rawPhone);
    const last10 = phoneKey.replace(/\D/g, "").slice(-10);
    const emailKey = (contact.email || "").toLowerCase();

    let matchedUser = null;

    if (phoneKey) {
      matchedUser = userMap.get(phoneKey);
    }
    if (!matchedUser && last10.length === 10) {
      matchedUser = userMap.get(last10);
    }
    if (!matchedUser && emailKey) {
      matchedUser = userMap.get(emailKey);
    }

    return {
      _id: matchedUser?._id || null,
      name:
        contact.name ||
        matchedUser?.name ||
        contact.email ||
        contact.phone ||
        contact.mobile ||
        contact.contactNumber ||
        "",
      email: matchedUser?.email || contact.email || "",
      phone:
        contact.phone ||
        contact.mobile ||
        contact.contactNumber ||
        contact.number ||
        matchedUser?.phone ||
        "",
      profilePic: matchedUser?.profilePic || "",
      isOnline: matchedUser?.isOnline || false,
      lastSeen: matchedUser?.lastSeen || null,
      isVerified: matchedUser?.isVerified || false,
      isAppUser: Boolean(matchedUser),
      userId: matchedUser?._id || null,
      chatId: null,
    };
  });
};

module.exports = {
  normalizePhone,
  extractContactsToMatch,
  mapContactsToUsers,
};
