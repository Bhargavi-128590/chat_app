const { Server } = require("socket.io");
const User = require("../models/User");

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
      } catch (error) {
        console.log("Setup Error:", error.message);
      }
    });

    // Join Chat Room
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);

      console.log("Joined Chat:", chatId);
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