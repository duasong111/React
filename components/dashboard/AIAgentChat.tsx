"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, User, ChevronDown, ChevronUp } from "lucide-react";

interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system" | "error";
  content: string;
  timestamp: Date;
}

interface AIAgentChatProps {
  collapsed?: boolean;
}

export default function AIAgentChat({ collapsed = false }: AIAgentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connectWebSocket = () => {
    try {
      // Use same host but port 3002 for WebSocket
      const wsUrl = `ws://${window.location.hostname}:3002`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setWsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const newMessage: ChatMessage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: data.type,
            content: data.content,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, newMessage]);
          setIsLoading(false);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        setWsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = () => {
        // WebSocket error is normal when server is not running
        // Don't log it, just update state
        setWsConnected(false);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      setWsConnected(false);
      setTimeout(connectWebSocket, 3000);
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim() || isLoading || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    wsRef.current.send(JSON.stringify({
      type: "chat",
      content: inputValue,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all w-full"
      >
        <MessageCircle className="size-5 shrink-0" />
        <span className="text-sm font-medium">AI Agent</span>
        <div className={"size-2 rounded-full ml-auto " + (wsConnected ? "bg-green-500" : "bg-red-500")} />
      </button>
    );
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-4 py-3 rounded-xl transition-all w-full"
      >
        <MessageCircle className="size-5 shrink-0" />
        <span className="text-sm font-medium">AI Agent</span>
        <div className={"size-2 rounded-full ml-auto " + (wsConnected ? "bg-green-500" : "bg-red-500")} />
        {isOpen ? <ChevronDown className="size-4 ml-2" /> : <ChevronUp className="size-4 ml-2" />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col h-[400px] bg-card/50 rounded-xl border border-border/50">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <Bot className="size-8 mx-auto mb-2 opacity-50" />
                    <p>开始和 AI Agent 对话吧</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={"flex gap-2 " + (msg.type === "user" ? "justify-end" : "justify-start")}
                    >
                      {msg.type !== "user" && (
                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Bot className="size-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={"max-w-[85%] px-3 py-2 rounded-xl text-sm " + (
                          msg.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : msg.type === "error"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-accent"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {msg.type === "user" && (
                        <div className="size-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <User className="size-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="size-4 text-primary" />
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-accent">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入问题..."
                    disabled={!wsConnected}
                    className="flex-1 h-9 px-3 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!wsConnected || !inputValue.trim() || isLoading}
                    className="size-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <div className={"size-1.5 rounded-full " + (wsConnected ? "bg-green-500" : "bg-red-500")} />
                  <span>{wsConnected ? "已连接" : "未连接"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}