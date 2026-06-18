"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Bot, User, Send, Loader2, MessageCircle, RefreshCw } from "lucide-react";

interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system" | "error";
  content: string;
  timestamp: Date;
}

export default function AIAgentPage() {
  const [username, setUsername] = useState<string>("");
  const [avatarFilename, setAvatarFilename] = useState<string | null>(null);
  const [updatedTime, setUpdatedTime] = useState<string | null>(null);
  const [createdTime, setCreatedTime] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem("username") || "User";
    const avatar = localStorage.getItem("avatar_filename");
    const updated = localStorage.getItem("updated_time");
    const created = localStorage.getItem("created_time");
    setUsername(user);
    setAvatarFilename(avatar);
    setUpdatedTime(updated);
    setCreatedTime(created);
  }, []);

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
      wsRef.current = new WebSocket("ws://localhost:3002");

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
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = () => {
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

  const clearChat = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "clear" }));
    }
  };

  if (!username) return null;

  return (
    <DashboardLayout
      username={username}
      avatarFilename={avatarFilename}
      updatedTime={updatedTime}
      createdTime={createdTime}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-7rem)] flex flex-col"
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <MessageCircle className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Agent 助手</h1>
              <p className="text-sm text-muted-foreground">基于 DeepSeek 模型驱动</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={"size-2 rounded-full " + (wsConnected ? "bg-green-500" : "bg-red-500")} />
              <span>{wsConnected ? "已连接" : "未连接"}</span>
            </div>
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors"
            >
              <RefreshCw className="size-4" />
              新对话
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-card/50 rounded-2xl border border-border/50 p-6 space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Bot className="size-16 mb-4 opacity-30" />
              <p className="text-lg mb-2">开始和 AI Agent 对话吧</p>
              <p className="text-sm">你可以询问关于设备管理、技术问题等</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={"flex gap-3 " + (msg.type === "user" ? "justify-end" : "justify-start")}
              >
                {msg.type !== "user" && (
                  <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                    <Bot className="size-5 text-white" />
                  </div>
                )}
                <div
                  className={"max-w-[70%] px-4 py-3 rounded-2xl " + (
                    msg.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : msg.type === "error"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-accent"
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {msg.type === "user" && (
                  <div className="size-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                    <User className="size-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))
          )}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                <Bot className="size-5 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-accent">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-card/50 rounded-2xl border border-border/50 p-4">
          <div className="flex gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              disabled={!wsConnected}
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!wsConnected || !inputValue.trim() || isLoading}
              className="size-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send className="size-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>按 Enter 发送，Shift + Enter 换行</span>
            <span>DeepSeek Chat</span>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}