const http = require("http");

const mongoose = require("mongoose");

const app = require("./app");

const { initSocket } = require("./config/socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ DB Connected");

    // Create server
    const server = http.createServer(app);

    // Initialize socket
    initSocket(server);

    // Listen server
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

  } catch (error) {

    console.log("❌ MongoDB Error");

    console.log(error);

  }
};

startServer();