"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Settings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  language: "zh-CN" | "en-US";
  notifications: boolean;
  compactMode: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  t: (key: string) => string;
}

const defaultSettings: Settings = {
  theme: "system",
  fontSize: "medium",
  language: "zh-CN",
  notifications: true,
  compactMode: false,
};

// Simple i18n translations
const translations: Record<string, Record<string, string>> = {
  "zh-CN": {
    dashboard: "仪表盘",
    devices: "设备管理",
    operations: "便捷操作",
    aiAgent: "AI Agent",
    settings: "系统设置",
    welcome: "欢迎回来",
    deviceManagement: "设备管理仪表盘",
    // Add more translations as needed
  },
  "en-US": {
    dashboard: "Dashboard",
    devices: "Devices",
    operations: "Operations",
    aiAgent: "AI Agent",
    settings: "Settings",
    welcome: "Welcome back",
    deviceManagement: "Device Management Dashboard",
    // Add more translations as needed
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("user_settings");
    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } catch {
        setSettings(defaultSettings);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply font size
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    document.documentElement.style.fontSize = fontSizeMap[settings.fontSize];

    // Apply theme
    const applyTheme = (theme: "light" | "dark" | "system") => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          root.classList.add("dark");
        }
        // Don't add "light" class for system - just rely on default
      } else if (theme === "dark") {
        root.classList.add("dark");
      }
      // For light mode, just remove dark class (default is light)
    };

    applyTheme(settings.theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (settings.theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings, mounted]);

  // Update language in html tag
  useEffect(() => {
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem("user_settings", JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const t = (key: string): string => {
    return translations[settings.language]?.[key] || translations["zh-CN"][key] || key;
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground" suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, t }}>
      {children}
    </SettingsContext.Provider>
  );
}