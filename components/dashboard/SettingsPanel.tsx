"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Palette, Type, Bell, Shield, Globe, Save, RotateCcw } from "lucide-react";

interface Settings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  language: "zh-CN" | "en-US";
  notifications: boolean;
  compactMode: boolean;
}

const defaultSettings: Settings = {
  theme: "system",
  fontSize: "medium",
  language: "zh-CN",
  notifications: true,
  compactMode: false,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("user_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("user_settings", JSON.stringify(settings));

    // Apply font size
    document.documentElement.style.fontSize = {
      small: "14px",
      medium: "16px",
      large: "18px",
    }[settings.fontSize];

    // Apply theme
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (settings.theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("user_settings");
    document.documentElement.style.fontSize = "16px";
    document.documentElement.classList.remove("dark");
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-3xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">系统设置</h1>
          <p className="text-muted-foreground mt-1">个性化您的使用体验</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-sm"
          >
            <RotateCcw className="size-4" />
            重置
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              saved
                ? "bg-green-500 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Save className="size-4" />
            {saved ? "已保存" : "保存设置"}
          </button>
        </div>
      </motion.div>

      {/* Appearance Settings */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 space-y-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Palette className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">外观设置</h2>
            <p className="text-sm text-muted-foreground">定制界面外观和显示效果</p>
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-3">
          <label className="text-sm font-medium">主题模式</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "浅色", icon: Sun },
              { value: "dark", label: "深色", icon: Moon },
              { value: "system", label: "跟随系统", icon: Monitor },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateSetting("theme", option.value as Settings["theme"])}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  settings.theme === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/50"
                }`}
              >
                <option.icon className="size-6" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <label className="text-sm font-medium">字体大小</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "small", label: "小", size: "12px" },
              { value: "medium", label: "中", size: "14px" },
              { value: "large", label: "大", size: "16px" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateSetting("fontSize", option.value as Settings["fontSize"])}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  settings.fontSize === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/50"
                }`}
              >
                <Type className="size-6" />
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Compact Mode */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">紧凑模式</label>
            <p className="text-xs text-muted-foreground mt-1">减少界面元素间距，在屏幕上显示更多内容</p>
          </div>
          <button
            onClick={() => updateSetting("compactMode", !settings.compactMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.compactMode ? "bg-primary" : "bg-accent"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.compactMode ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Language & Notifications */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 space-y-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Globe className="size-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">语言与通知</h2>
            <p className="text-sm text-muted-foreground">配置语言偏好和通知设置</p>
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <label className="text-sm font-medium">界面语言</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "zh-CN", label: "简体中文" },
              { value: "en-US", label: "English" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateSetting("language", option.value as Settings["language"])}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  settings.language === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/50"
                }`}
              >
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="size-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium">消息通知</label>
              <p className="text-xs text-muted-foreground mt-1">接收系统更新和设备警报通知</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting("notifications", !settings.notifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.notifications ? "bg-primary" : "bg-accent"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.notifications ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Shield className="size-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">关于系统</h2>
            <p className="text-sm text-muted-foreground">系统信息和版本</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border/30">
            <span className="text-muted-foreground">版本号</span>
            <span className="font-medium">v2.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/30">
            <span className="text-muted-foreground">构建时间</span>
            <span className="font-medium">2026-06-15</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">前端框架</span>
            <span className="font-medium">Next.js 15 + React 19</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
