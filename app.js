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

app.disable("x-powered-by");

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads folder
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/chats", chatRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/notifications", notificationRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

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
