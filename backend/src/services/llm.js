const openai = require("../config/ai");

const SUPPORT_UNAVAILABLE =
  "Sorry, the support agent is temporarily unavailable. Please try again later.";

const STORE_KNOWLEDGE = `
You are a helpful support agent for a small e-commerce store.

Store policies:
- Shipping: We ship worldwide. Orders ship within 2–3 business days.
- Returns: 30-day return policy. Items must be unused.
- Refunds: Refunds processed within 5 business days after inspection.
- Support hours: Monday to Friday, 9 AM – 6 PM IST.
`;

// Fallback replies when OPENAI_API_KEY is not set (so chat still works for demo)
function getFallbackReply(userMessage) {
  const m = (userMessage || "").toLowerCase();
  if (/return|refund|policy/i.test(m)) {
    return "We have a 30-day return policy. Items must be unused and in original packaging. Refunds are processed within 5 business days after inspection.";
  }
  if (/shipping|ship|delivery|usa|worldwide/i.test(m)) {
    return "We ship worldwide. Orders ship within 2–3 business days. Need help with a specific region?";
  }
  if (/hour|time|support|contact/i.test(m)) {
    return "Support hours are Monday to Friday, 9 AM – 6 PM IST. How can we help?";
  }
  return "Thanks for your message! How can we help you today?";
}

async function generateReply(history, userMessage) {
  if (!openai) {
    return getFallbackReply(userMessage);
  }

  // Ensure history is an array of plain { sender, text } (Mongoose docs can have getters)
  const safeHistory = Array.isArray(history)
    ? history.map((msg) => ({
        sender: msg.sender,
        text: String(msg.text ?? msg.content ?? ""),
      }))
    : [];

  try {
    const messages = [
      { role: "system", content: STORE_KNOWLEDGE },
      ...safeHistory.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: String(userMessage ?? "") },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 200,
    });

    const content = response?.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) {
      return content.trim();
    }
    return getFallbackReply(userMessage);
  } catch (error) {
    console.error("LLM Error:", error?.message || error);
    return getFallbackReply(userMessage);
  }
}

module.exports = generateReply;
module.exports.SUPPORT_UNAVAILABLE = SUPPORT_UNAVAILABLE;
