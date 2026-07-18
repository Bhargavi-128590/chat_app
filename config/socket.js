const { Server } = require("socket.io");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // User Setup
    socket.on("setup", async (userId) => {
      try {
        socket.join(userId);

        socket.userId = userId;

        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
        });

        io.emit("user_online", userId);

        console.log("User Room Joined:", userId);

        // Find all active chats this user is in
        const chats = await Chat.find({ users: userId });
        const chatIds = chats.map((c) => c._id);

        if (chatIds.length > 0) {
          // Find all messages in these chats that weren't sent by this user and aren't delivered to them yet
          const messagesToUpdate = await Message.find({
            chat: { $in: chatIds },
            sender: { $ne: userId },
            deliveredTo: { $ne: userId },
          });

          if (messagesToUpdate.length > 0) {
            // Update the messages in bulk
            await Message.updateMany(
              {
                _id: { $in: messagesToUpdate.map((m) => m._id) },
              },
              {
                $addToSet: { deliveredTo: userId },
              }
            );

            // Group by chat to emit delivery updates to the senders in those rooms
            const chatsToNotify = [
              ...new Set(messagesToUpdate.map((m) => m.chat.toString())),
            ];
            chatsToNotify.forEach((chatId) => {
              socket.to(chatId).emit("chat_delivered", {
                chatId,
                userId,
              });
            });
          }
        }
      } catch (error) {
        console.log("Setup Error:", error.message);
      }
    });

    // Join Chat Room
    socket.on("join_chat", async (chatId) => {
      socket.join(chatId);

      console.log("Joined Chat:", chatId);

      try {
        const userId = socket.userId;
        if (userId) {
          // 1. Mark all messages as delivered
          const deliveredResult = await Message.updateMany(
            {
              chat: chatId,
              sender: { $ne: userId },
              deliveredTo: { $ne: userId },
            },
            {
              $addToSet: { deliveredTo: userId },
            }
          );

          if (deliveredResult.modifiedCount > 0) {
            socket.to(chatId).emit("chat_delivered", {
              chatId,
              userId,
            });
          }

          // 2. Mark all messages as read (seen)
          const seenResult = await Message.updateMany(
            {
              chat: chatId,
              sender: { $ne: userId },
              seenBy: { $ne: userId },
            },
            {
              $addToSet: { seenBy: userId },
            }
          );

          if (seenResult.modifiedCount > 0) {
            socket.to(chatId).emit("chat_seen", {
              chatId,
              userId,
            });
          }
        }
      } catch (err) {
        console.error("Error updating ticks on join_chat:", err);
      }
    });

    // Typing Event
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing", {
        chatId,
        userId: socket.userId,
      });
    });

    // Stop Typing Event
    socket.on("stop_typing", (chatId) => {
      socket.to(chatId).emit("stop_typing", {
        chatId,
        userId: socket.userId,
      });
    });

    // Disconnect Event
    socket.on("disconnect", async () => {
      try {
        console.log("User Disconnected:", socket.id);

        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: Date.now(),
            socketId: "",
          });

          io.emit("user_offline", socket.userId);
        }
      } catch (error) {
        console.log("Disconnect Error:", error.message);
      }
    });
  });

  return io;
};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO,
};