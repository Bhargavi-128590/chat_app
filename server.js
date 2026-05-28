const http = require("http");

const app = require("./app");

const { initSocket } = require("./config/socket");

// Create server
const server = http.createServer(app);

// Initialize socket
initSocket(server);

const PORT = process.env.PORT || 5000;

// Listen server
server.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Server running on port ${PORT}`
  );

});