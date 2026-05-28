const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    isGroupChat: {
      type: Boolean,
      default: false,
    },

    groupName: {
      type: String,
      trim: true,
      default: "",
    },

    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Optional group image
    groupImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chatSchema.index({ users: 1 });

chatSchema.index({ updatedAt: -1 });

module.exports = mongoose.model(
  "Chat",
  chatSchema
);