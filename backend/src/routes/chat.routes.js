const express = require("express");
const Conversation = require("../models/conversations");
const Message = require("../models/message");
const generateReply = require("../services/llm");

const router = express.Router();

router.post("/message", async (req, res) => {
  try {
    let { message, sessionId } = req.body;

    // ✅ Validation
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (message.length > 1000) {
      message = message.slice(0, 1000);
    }

    // ✅ Create or fetch conversation
    let conversation;
    if (sessionId) {
      conversation = await Conversation.findById(sessionId);
    }
    if (!conversation) {
      conversation = await Conversation.create({});
    }

    // ✅ Save user message
    await Message.create({
      conversationId: conversation._id,
      sender: "user",
      text: message,
    });

    // ✅ Fetch conversation history (limit last 10)
    const history = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ timestamp: 1 })
      .limit(10);

    // ✅ Generate AI reply
    let reply;
    try {
      reply = await generateReply(history, message);
    } catch {
      reply =
        "Sorry 😔 I'm having trouble responding right now. Please try again in a moment.";
    }

    // ✅ Save AI reply
    await Message.create({
      conversationId: conversation._id,
      sender: "ai",
      text: reply,
    });

    res.json({
      reply,
      sessionId: conversation._id,
    });
  } catch (err) {
    console.error("Chat API Error:", err);
    res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
  }
});
// GET chat history by sessionId
router.get("/history/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const messages = await Message.find({
      conversationId: sessionId,
    }).sort({ timestamp: 1 });

    res.json({ messages });
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({
      error: "Failed to fetch conversation history",
    });
  }
});


module.exports = router;
