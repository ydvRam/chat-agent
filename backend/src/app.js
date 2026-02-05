const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chat.routes");

const app = express();

// CORS: allow frontend (and any origin) so Render frontend can call this API
app.use(
  cors({
    origin: true, // allow the request origin (e.g. https://ai-chat-qd95.onrender.com)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

app.use("/chat", chatRoutes);

module.exports = app;
