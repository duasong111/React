"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Bot, User, Send, Loader2, MessageCircle, RefreshCw, AlertCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system" | "error";
  content: string;
  timestamp: Date;
}

const DAILY_LIMIT = 10;

export default function AIAgentPage() {
  const [username, setUsername] = useState<string>("");
  const [avatarFilename, setAvatarFilename] = useState<string | null>(null);
  const [updatedTime, setUpdatedTime] = useState<string | null>(null);
  const [createdTime, setCreatedTime] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [dailyUsage, setDailyUsage] = useState<number | null>(null);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    // Connect to Flask WebSocket (Flask runs on port 5000)
    const socket = io('http://localhost:5000', {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log("WebSocket connected");
      setWsConnected(true);
      // 启动心跳
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        socket.emit('ping_server');
      }, 20000);
    });

    socket.on('disconnect', () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    });

    socket.on('pong', () => {
      // 心跳响应
    });

    socket.on('connected', (data: any) => {
      const welcomeMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: data.message || '你好！我是 AI Agent，有什么我可以帮助你的吗？',
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    });

    // 流式开始
    socket.on('ai_stream_start', () => {
      const msgId = Date.now().toString() + Math.random().toString(36).slice(2, 11);
      streamingMessageIdRef.current = msgId;
      setIsLoading(true);
      // 添加空消息到数组
      setMessages(prev => [
        ...prev,
        {
          id: msgId,
          type: 'assistant' as const,
          content: '',
          timestamp: new Date(),
        }
      ]);
    });

    // 流式 token
    socket.on('ai_stream_token', (data: { token: string }) => {
      if (!data.token) return;
      // 过滤掉工具执行标记
      if (data.token.startsWith('[TOOL_') || data.token === '[TOOL_COMPLETE]' || data.token === '[TOOL_ERROR]') {
        return;
      }
      const currentId = streamingMessageIdRef.current;
      if (!currentId) return;
      setMessages(prev => {
        if (!prev.find(m => m.id === currentId)) return prev;
        return prev.map(m =>
          m.id === currentId
            ? { ...m, content: m.content + data.token }
            : m
        );
      });
    });

    // 流式结束
    socket.on('ai_stream_end', (data: { answer: string; tool_calls: any[]; success: boolean; daily_usage: number | null; daily_limit: number }) => {
      setIsLoading(false);
      const currentId = streamingMessageIdRef.current;
      streamingMessageIdRef.current = null;

      if (data.success) {
        // 如果消息内容为空，用 answer 填充
        if (currentId && data.answer) {
          setMessages(prev => {
            const existing = prev.find(m => m.id === currentId);
            if (existing && !existing.content) {
              return prev.map(m => m.id === currentId ? { ...m, content: data.answer } : m);
            }
            return prev;
          });
        }
        if (data.daily_usage != null) {
          setDailyUsage(data.daily_usage);
          const remaining = DAILY_LIMIT - data.daily_usage;
          setLimitExceeded(remaining <= 0);
        }
      } else {
        if (data.answer && data.answer.includes('次数已用完') && username !== 'duasong') {
        }
        const errorMsg: ChatMessage = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
          type: 'error',
          content: data.answer || '请求失败',
          timestamp: new Date(),
        };
        setMessages(prev => {
          if (currentId) {
            return [...prev.filter(m => m.id !== currentId), errorMsg];
          }
          return [...prev, errorMsg];
        });
      }
    });

    // 兼容旧的 ai_response
    socket.on('ai_response', (data: any) => {
      if (data.success) {
        if (data.daily_usage !== undefined && username !== 'duasong') {
			setDailyUsage(data.daily_usage);
			const remaining = DAILY_LIMIT - data.daily_usage;
			setLimitExceeded(remaining <= 0);
        }
        const responseMsg: ChatMessage = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
          type: 'assistant',
          content: data.answer || data.message || '',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, responseMsg]);
      } else {
        if (data.message && data.message.includes('次数已用完') && username !== 'duasong') {
			setLimitExceeded(true);
        }
        const errorMsg: ChatMessage = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
          type: 'error',
          content: data.message || '请求失败',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
      setIsLoading(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputValue.trim() || isLoading || !socketRef.current || !wsConnected) {
      return;
    }

    if (limitExceeded && username !== 'duasong') {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        type: "error",
        content: `今日AI对话次数已用完（${dailyUsage || 0}/${DAILY_LIMIT}），请明天再试`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // 构建历史记录：已有的 messages + 当前用户消息
    const history = [
      ...messages
        .filter(m => m.type === "user" || m.type === "assistant")
        .map(m => ({
          role: m.type === "user" ? "user" : "assistant",
          content: m.content
        })),
      { role: "user", content: inputValue }
    ];

    socketRef.current.emit('ai_chat', {
      message: inputValue,
      history: history,
      username: username,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!username) return null;

  const remaining = dailyUsage !== null ? Math.max(0, DAILY_LIMIT - dailyUsage) : DAILY_LIMIT;

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
          <div className="flex items-center gap-4">
            {username !== "duasong" && (
              <div className={"flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm " + (limitExceeded ? "bg-red-500/10 text-red-500" : "bg-accent/50")}>
                {limitExceeded ? (
                  <AlertCircle className="size-4" />
                ) : null}
                <span className={limitExceeded ? "" : "text-muted-foreground"}>
                  剩余次数: <span className={"font-bold " + (remaining <= 3 ? "text-orange-500" : "")}>{remaining}</span> / {DAILY_LIMIT}
                </span>
              </div>
            )}
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

        {/* Limit Warning Banner */}
        {limitExceeded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2 text-sm"
          >
            <AlertCircle className="size-5 shrink-0" />
            <span>今日 AI 对话次数已用完（{dailyUsage || 0}/{DAILY_LIMIT}），请明天再来吧</span>
          </motion.div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-card/50 rounded-2xl border border-border/50 p-6 space-y-4 mb-4">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Bot className="size-16 mb-4 opacity-30" />
              <p className="text-lg mb-2">开始和 AI Agent 对话吧</p>
              <p className="text-sm">你可以询问关于设备管理、技术问题等</p>
              {username !== "duasong" ? (
                <p className="text-xs mt-4">今日剩余 {remaining} / {DAILY_LIMIT} 次对话</p>
              ) : (
                <p className="text-xs mt-4">管理员模式 · 无使用限制</p>
              )}
            </div>
          )}
          {messages.map((msg) => (
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
                {msg.type === "assistant" ? (
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                )}
                <p className="text-xs opacity-60 mt-1">
                  {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {msg.type === "user" && avatarFilename ? (
                <img
                  src={`http://localhost:5000/api/avatar/${avatarFilename}`}
                  alt="avatar"
                  className="size-10 rounded-full object-cover shrink-0"
                />
              ) : msg.type === "user" ? (
                <div className="size-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                  <User className="size-5 text-white" />
                </div>
              ) : null}
            </motion.div>
          ))}
          {isLoading && messages.length > 0 && (
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
              placeholder={limitExceeded ? "今日次数已用完，请明天再试" : "输入你的问题..."}
              disabled={!wsConnected || limitExceeded}
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!wsConnected || !inputValue.trim() || isLoading || limitExceeded}
              className="size-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="size-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>按 Enter 发送，Shift + Enter 换行</span>
            {username !== "duasong" ? (
              <span>DeepSeek Chat · 剩余 {remaining} 次</span>
            ) : (
              <span>DeepSeek Chat · 管理员模式</span>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
