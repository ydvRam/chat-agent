import { useState, useEffect } from "react";
import { sendMessage, getHistory } from "../api/chat";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const SESSION_KEY = "chat_session_id";

function normalizeMessage(msg) {
  return {
    id: msg._id ?? msg.id,
    sender: msg.sender,
    text: msg.text ?? "",
    timestamp: msg.timestamp ?? msg.createdAt,
  };
}

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load session from storage on mount and fetch history if we have a sessionId
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      setSessionId(stored);
      getHistory(stored)
        .then((res) => {
          const list = (res.messages || []).map(normalizeMessage);
          setMessages(list);
        })
        .catch((err) => {
          console.warn("Failed to load history:", err?.message);
        })
        .finally(() => setHistoryLoaded(true));
    } else {
      setHistoryLoaded(true);
    }
  }, []);

  const handleSend = async (text) => {
    setError(null);
    setLoading(true);

    const userMsg = {
      id: crypto.randomUUID?.() ?? `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await sendMessage(text, sessionId || undefined);
      const newSessionId = res.sessionId?.toString?.() ?? res.sessionId;
      if (newSessionId) {
        setSessionId(newSessionId);
        sessionStorage.setItem(SESSION_KEY, newSessionId);
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: res.reply ?? "",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const message =
        err.response?.data?.error ?? err.message ?? "Something went wrong.";
      setError(message);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Sorry, we couldn't get a response. ${message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-125 w-full max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="bg-indigo-600 text-white px-4 py-3">
        <h2 className="font-semibold text-lg">Support Chat</h2>
        <p className="text-indigo-100 text-xs">We typically reply in a moment</p>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <MessageList messages={messages} isAgentTyping={loading} />
      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
