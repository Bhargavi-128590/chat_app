const express = require("express");

const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const chatRoutes = require("./routes/chatRoutes");

const messageRoutes = require("./routes/messageRoutes");

const uploadRoutes = require("./routes/uploadRoutes");

const notificationRoutes = require("./routes/notificationRoutes");

const swaggerDocs = require("./config/swagger");

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/chats", chatRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/upload", uploadRoutes);


app.use("/api/notifications", notificationRoutes);
console.log("Notification Routes Loaded");

// Swagger
swaggerDocs(app);

// Default route
app.get("/", (req, res) => {
  res.send("Chat API Running");
});

app.get("/test", (req, res) => {
  res.send("TEST WORKING");
});

module.exports = app;
