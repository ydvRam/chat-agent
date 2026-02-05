const OpenAI = require("openai");

const apiKey = process.env.OPENAI_API_KEY;
let openai = null;
if (apiKey && apiKey.trim()) {
  openai = new OpenAI({ apiKey: apiKey.trim() });
} else {
  console.warn(
    "OPENAI_API_KEY is not set. Chat will use a fallback message instead of the LLM."
  );
}

module.exports = openai;
