// const Message = require("../models/Message");
// const Chat = require("../models/Chat");
// const Notification = require("../models/Notification");
// const User = require("../models/User");

// const { getIO } = require("../config/socket");

// exports.sendMessage = async (req, res) => {
//   try {
//     const { content, chatId, messageType, mediaUrl } = req.body;

//     if (!chatId) {
//       return res.status(400).json({
//         success: false,
//         message: "ChatId is required",
//       });
//     }

//     let message = await Message.create({
//       sender: req.user._id,
//       chat: chatId,
//       content: content || "",
//       messageType: messageType || "text",
//       mediaUrl: mediaUrl || "",
//       deliveredTo: [req.user._id],
//       seenBy: [req.user._id],
//     });

//     message = await message.populate("sender", "name email profilePic");

//     await Chat.findByIdAndUpdate(chatId, {
//       latestMessage: message._id,
//     });

//     const chat = await Chat.findById(chatId);

//     const receivers = chat.users.filter(
//       (user) => user.toString() !== req.user._id.toString(),
//     );

//     // SOCKET
//     const io = getIO();

//     io.to(chatId).emit("receive_message", message);

//     // NOTIFICATIONS
//     for (const receiverId of receivers) {
//       const notification = await Notification.create({
//         sender: req.user._id,

//         receiver: receiverId,

//         chat: chatId,

//         message: message._id,

//         title: "New Message",

//         body: content,
//       });

//       const populatedNotification = await Notification.findById(
//         notification._id,
//       ).populate("sender", "name profilePic");

//       io.to(receiverId.toString()).emit(
//         "new_notification",
//         populatedNotification,
//       );
//     }
//     return res.status(201).json({
//       success: true,
//       message,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.getMessages = async (req, res) => {
//   try {
//     const page = Number(req.query.page) || 1;

//     const limit = 20;

//     const skip = (page - 1) * limit;

//     const messages = await Message.find({
//       chat: req.params.chatId,
//     })
//       .populate("sender", "name email profilePic")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.status(200).json({
//       success: true,
//       messages: messages.reverse(),
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.editMessage = async (req, res) => {
//   try {
//     const { content } = req.body;

//     const message = await Message.findById(req.params.messageId);

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: "Message not found",
//       });
//     }

//     // Only sender can edit
//     if (message.sender.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized",
//       });
//     }

//     message.content = content;

//     message.isEdited = true;

//     await message.save();

//     res.status(200).json({
//       success: true,
//       message,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.deleteMessage = async (req, res) => {
//   try {
//     const message = await Message.findById(req.params.messageId);

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: "Message not found",
//       });
//     }

//     // Only sender can delete
//     if (message.sender.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized",
//       });
//     }

//     await message.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: "Message deleted",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.markAsSeen = async (req, res) => {
//   try {

//     const { messageId } = req.params;

//     const message = await Message.findById(messageId);

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: "Message not found"
//       });
//     }

//     if (!message.seenBy.includes(req.user._id)) {
//       message.seenBy.push(req.user._id);
//     }

//     await message.save();

//     const io = getIO();

//     io.to(message.chat.toString()).emit(
//       "message_seen",
//       {
//         messageId,
//         userId: req.user._id
//       }
//     );

//     res.status(200).json({
//       success: true
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });

//   }
// };

const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");
const { getIO } = require("../config/socket");

const { createNotification } = require("../services/notificationService");

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { content, chatId, messageType, mediaUrl } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "ChatId is required",
      });
    }

    let message = await Message.create({
      sender: req.user._id,

      chat: chatId,

      content: content || "",

      messageType: messageType || "text",

      mediaUrl: mediaUrl || "",

      deliveredTo: [req.user._id],

      seenBy: [req.user._id],
    });

    message = await message.populate(
      "sender",

      "name email profilePic",
    );

    await Chat.findByIdAndUpdate(
      chatId,

      {
        latestMessage: message._id,
      },
    );

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const receivers = chat.users.filter(
      (u) => u.toString() !== req.user._id.toString(),
    );

    const io = getIO();

    /*
Real time message
*/
    io.to(chatId).emit(
      "receive_message",

      message,
    );

    for (const receiverId of receivers) {
      const notification = await createNotification({
        recipient: receiverId,

        sender: req.user._id,

        title: "New Message",

        body: content || "New message",

        chat: chatId,

        message: message._id,
      });

      const populatedNotification = await notification.populate(
        "sender",

        "name profilePic",
      );

      io.to(receiverId.toString())

        .emit(
          "new_notification",

          populatedNotification,
        );
    }

    return res.status(201).json({
      success: true,

      message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name email profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { content } = req.body;

    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    message.content = content;
    message.isEdited = true;

    await message.save();

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await message.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (!message.seenBy.includes(req.user._id)) {
      message.seenBy.push(req.user._id);
    }

    await message.save();

    const io = getIO();

    io.to(message.chat.toString()).emit("message_seen", {
      messageId,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
