const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
