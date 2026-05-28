const Chat = require("../models/Chat");

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

    const fullChat = await Chat.findById(newChat._id)
      .populate("users", "-otp");

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

    const fullGroup = await Chat.findById(
      groupChat._id
    )
      .populate("users", "-otp")
      .populate(
        "groupAdmin",
        "name email profilePic"
      );

    res.status(201).json(fullGroup);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

exports.addToGroup = async (req, res) => {

  const { chatId, userId } = req.body;

  const updatedChat =
    await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: {
          users: userId,
        },
      },
      {
        new: true,
      }
    );

  res.json(updatedChat);
};

exports.removeFromGroup = async (req, res) => {

  const { chatId, userId } = req.body;

  const updatedChat =
    await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: {
          users: userId,
        },
      },
      {
        new: true,
      }
    );

  res.json(updatedChat);
};