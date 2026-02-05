import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Send a message and get AI reply.
 * @param {string} message
 * @param {string} [sessionId]
 * @returns {Promise<{ reply: string, sessionId: string }>}
 */
export async function sendMessage(message, sessionId) {
  const { data } = await api.post("/chat/message", { message, sessionId });
  return data;
}

/**
 * Fetch conversation history by sessionId.
 * @param {string} sessionId
 * @returns {Promise<{ messages: Array<{ sender, text, timestamp }> }>}
 */
export async function getHistory(sessionId) {
  const { data } = await api.get(`/chat/history/${sessionId}`);
  return data;
}
