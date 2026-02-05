const express = require('express');
const router = express.Router();
const {
  createConversation,
  getConversationById,
  addMessage,
  getMessages,
  MAX_MESSAGE_LENGTH,
} = require('../services/conversation');
const { generateReply, SUPPORT_UNAVAILABLE } = require('../services/llm');

// MongoDB ObjectId is 24 hex characters
const SESSION_ID_REGEX = /^[a-f0-9]{24}$/i;

/**
 * POST /chat/message
 * Body: { message: string, sessionId?: string }
 * Returns: { reply: string, sessionId: string } or { error: string }
 */
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body || {};

    const raw = typeof message === 'string' ? message.trim() : '';
    if (!raw) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }
    if (raw.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    let conversation;
    if (sessionId) {
      if (!SESSION_ID_REGEX.test(sessionId)) {
        return res.status(404).json({ error: 'Invalid session.' });
      }
      conversation = await getConversationById(sessionId);
      if (!conversation) {
        return res.status(404).json({ error: 'Session not found.' });
      }
    } else {
      conversation = await createConversation();
    }

    const conversationId = conversation.id;

    await addMessage(conversationId, 'user', raw);

    const history = await getMessages(conversationId);
    let reply;
    try {
      reply = await generateReply(history, raw);
    } catch (err) {
      console.error('LLM error:', err);
      reply = SUPPORT_UNAVAILABLE;
    }

    await addMessage(conversationId, 'ai', reply);

    return res.status(200).json({ reply, sessionId: conversationId });
  } catch (err) {
    console.error('POST /chat/message error:', err);
    return res
      .status(500)
      .json({ error: 'Something went wrong. Please try again.' });
  }
});

/**
 * GET /chat/session/:sessionId or GET /chat/history/:sessionId
 * Returns: { messages: Array<{ sender, text, timestamp }>, sessionId: string } or 404
 */
async function getSessionHistory(req, res) {
  try {
    const { sessionId } = req.params;
    if (!sessionId || !SESSION_ID_REGEX.test(sessionId)) {
      return res.status(404).json({ error: 'Invalid session.' });
    }

    const conversation = await getConversationById(sessionId);
    if (!conversation) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const messages = await getMessages(sessionId, 500);
    return res.status(200).json({ messages, sessionId });
  } catch (err) {
    console.error('GET chat history error:', err);
    return res
      .status(500)
      .json({ error: 'Something went wrong. Please try again.' });
  }
}

router.get('/session/:sessionId', getSessionHistory);
router.get('/history/:sessionId', getSessionHistory);

module.exports = router;