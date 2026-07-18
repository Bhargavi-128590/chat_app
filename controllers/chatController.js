const Chat = require("../models/Chat");
const User = require("../models/User");
const {
  extractContactsToMatch,
  mapContactsToUsers,
} = require("../utils/contactMatcher");

exports.accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    // Check existing one-to-one chat
    let existingChat = await Chat.findOne({
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [req.user._id, userId],
      },
    })
      .populate("users", "-otp")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email profilePic",
        },
      });

    if (existingChat) {
      return res.status(200).json({
        success: true,
        chat: existingChat,
      });
    }

    // Create new chat
    const newChat = await Chat.create({
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate("users", "-otp");

    res.status(201).json({
      success: true,
      chat: fullChat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const search = req.query.search || "";
    const searchText = search.trim();
    const incomingContacts = extractContactsToMatch(
      req.body?.contacts ?? req.body ?? req.query?.contacts ?? req.query ?? [],
    );

    let contactsToMatch = [];

    if (Array.isArray(incomingContacts) && incomingContacts.length > 0) {
      contactsToMatch = incomingContacts;
    } else if (searchText) {
      contactsToMatch = [{ name: searchText, email: searchText }];
    }

    if (contactsToMatch.length === 0 && !searchText) {
      return res.status(200).json({
        success: true,
        contacts: [],
      });
    }

    const filter = {
      _id: { $ne: req.user._id },
    };

    if (searchText && contactsToMatch.length === 0) {
      filter.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name email profilePic isOnline lastSeen isVerified phone")
      .sort({ name: 1, email: 1 });

    const matchedContacts = mapContactsToUsers(
      contactsToMatch,
      users,
      req.user._id,
    );

    if (contactsToMatch.length > 0) {
      return res.status(200).json({
        success: true,
        contacts: matchedContacts,
      });
    }

    const contacts = users.map((user) => ({
      _id: user._id,
      name: user.name || user.email,
      email: user.email,
      phone: user.phone || "",
      profilePic: user.profilePic,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      isVerified: user.isVerified,
      isAppUser: true,
      userId: user._id,
      chatId: null,
    }));

    res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: {
        $in: [req.user._id],
      },
    })
      .populate("users", "-otp")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email profilePic",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSingleChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("users", "-otp")
      .populate("groupAdmin", "name email profilePic")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email profilePic",
        },
      });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createGroupChat = async (req, res) => {
  try {
    const { users, groupName } = req.body;

    if (!users || !groupName) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const parsedUsers = JSON.parse(users);

    parsedUsers.push(req.user._id);

    const groupChat = await Chat.create({
      users: parsedUsers,
      isGroupChat: true,
      groupName,
      groupAdmin: req.user._id,
    });

    const fullGroup = await Chat.findById(groupChat._id)
      .populate("users", "-otp")
      .populate("groupAdmin", "name email profilePic");

    res.status(201).json(fullGroup);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        users: userId,
      },
    },
    {
      new: true,
    },
  );

  res.json(updatedChat);
};

exports.removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        users: userId,
      },
    },
    {
      new: true,
    },
  );

  res.json(updatedChat);
};
