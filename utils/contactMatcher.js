const normalizePhone = (value) => {
  if (!value) return "";

  const cleaned = String(value).trim();

  if (!cleaned) return "";

  const digits = cleaned.replace(/\D/g, "");

  if (!digits) return "";

  return digits.length > 10 ? `+${digits}` : digits;
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
      userMap.set(phoneKey, user);
    }

    if (emailKey) {
      userMap.set(emailKey, user);
    }
  });

  return contacts.map((contact) => {
    const phoneKey = normalizePhone(
      contact.phone || contact.mobile || contact.contactNumber,
    );
    const emailKey = (contact.email || "").toLowerCase();
    const matchedUser = userMap.get(phoneKey) || userMap.get(emailKey) || null;

    return {
      _id: matchedUser?._id || null,
      name:
        contact.name ||
        matchedUser?.name ||
        contact.email ||
        contact.phone ||
        "",
      email: matchedUser?.email || contact.email || "",
      phone:
        contact.phone ||
        contact.mobile ||
        contact.contactNumber ||
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
  mapContactsToUsers,
};
