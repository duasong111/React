"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Palette, Type, Bell, Shield, Globe, Save, RotateCcw, Check } from "lucide-react";
import { useSettings } from "@/components/providers/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { settings, updateSetting, t } = useSettings();
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    updateSetting("theme", "system");
    updateSetting("fontSize", "medium");
    updateSetting("language", "zh-CN");
    updateSetting("notifications", true);
    updateSetting("compactMode", false);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
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
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
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
                onClick={() => updateSetting("theme", option.value as "light" | "dark" | "system")}
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
          <Select
            value={settings.fontSize}
            onValueChange={(value) => updateSetting("fontSize", value as "small" | "medium" | "large")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择字体大小" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">
                <div className="flex items-center gap-2">
                  <Type className="size-4" />
                  <span>小 (14px)</span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <Type className="size-4" />
                  <span>中 (16px)</span>
                </div>
              </SelectItem>
              <SelectItem value="large">
                <div className="flex items-center gap-2">
                  <Type className="size-4" />
                  <span>大 (18px)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">当前字体大小预览：<span style={{ fontSize: settings.fontSize === 'small' ? '14px' : settings.fontSize === 'medium' ? '16px' : '18px' }}>这是一段示例文字</span></p>
        </div>

        {/* Compact Mode */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">紧凑模式</label>
            <p className="text-xs text-muted-foreground mt-1">减少界面元素间距，在屏幕上显示更多内容</p>
          </div>
          <Switch
            checked={settings.compactMode}
            onCheckedChange={(checked) => updateSetting("compactMode", checked)}
          />
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
          <Select
            value={settings.language}
            onValueChange={(value) => updateSetting("language", value as "zh-CN" | "en-US")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择语言" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh-CN">简体中文</SelectItem>
              <SelectItem value="en-US">English</SelectItem>
            </SelectContent>
          </Select>
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
          <Switch
            checked={settings.notifications}
            onCheckedChange={(checked) => updateSetting("notifications", checked)}
          />
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
            <span className="font-medium">Next.js 16 + React 19</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}