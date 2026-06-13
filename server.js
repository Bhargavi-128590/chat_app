require("dotenv").config();

const http = require("http");
const app = require("./app");

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { initSocket } = require("./config/socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("Starting Server...");

    await connectDB();

    await connectRedis();

    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup Error:");
    console.error(error);
    process.exit(1);
  }
};

startServer();