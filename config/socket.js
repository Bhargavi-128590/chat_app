const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("setup", async (userId) => {
      socket.join(userId);

      socket.userId = userId;

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        socketId: socket.id,
      });

      io.emit("user_online", userId);
    });

    // Setup user room
    socket.on("setup", (userId) => {
      socket.join(userId);

      socket.userId = userId;

      console.log("User room joined:", userId);
    });

    // Join chat
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);

      console.log("Joined chat:", chatId);
    });

    // Typing
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing", {
        chatId,
        userId: socket.userId,
      });
    });

    // Stop typing
    socket.on("stop_typing", (chatId) => {
      socket.to(chatId).emit("stop_typing", {
        chatId,
        userId: socket.userId,
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");

      socket.on("disconnect", async () => {
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: Date.now(),
            socketId: "",
          });

          io.emit("user_offline", socket.userId);
        }
      });
    });
  });

  return io;
};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO,
};
