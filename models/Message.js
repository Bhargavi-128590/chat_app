const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    content: {
      type: String,
      trim: true,
      default: "",
    },

    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },

    mediaUrl: {
      type: String,
      default: "",
    },

    // Message reply feature
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Edited message
    isEdited: {
      type: Boolean,
      default: false,
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Read receipts
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Delivery receipts
    deliveredTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ chat: 1 });

messageSchema.index({ sender: 1 });

messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model(
  "Message",
  messageSchema
);