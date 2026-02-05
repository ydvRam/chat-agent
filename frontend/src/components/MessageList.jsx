import { useEffect, useRef } from "react";

export default function MessageList({ messages, isAgentTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAgentTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
      {messages.length === 0 && !isAgentTyping && (
        <p className="text-center text-gray-500 text-sm py-8">
          Send a message to start the conversation.
        </p>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
              msg.sender === "user"
                ? "bg-indigo-600 text-white rounded-br-md"
                : "bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200"
            }`}
          >
            <p className="text-xs font-medium opacity-80 mb-0.5">
              {msg.sender === "user" ? "You" : "Support"}
            </p>
            <p className="text-sm whitespace-pre-wrap wrap-break-word">
              {msg.text}
            </p>
          </div>
        </div>
      ))}
      {isAgentTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-md px-4 py-2.5 border border-gray-200">
            <p className="text-xs font-medium mb-0.5">Support</p>
            <span className="text-sm italic">Agent is typing…</span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
