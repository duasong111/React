"use client";

import { useState, useEffect } from "react";
import Lightning from "@/components/Lightning";
import SideRays from "@/components/SideRays";

export default function LightningBackground() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("user_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setTheme(parsed.theme || "system");
      } catch {
        // ignore
      }
    }
    setMounted(true);

    // Listen for storage changes
    const handleStorageChange = () => {
      const saved = localStorage.getItem("user_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTheme(parsed.theme || "system");
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom event when settings change
    window.addEventListener("settings-changed", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("settings-changed", handleStorageChange);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  // For "system" theme, check media query
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {isDark ? (
        <Lightning hue={230} speed={0.5} intensity={0.8} size={3} />
      ) : (
        <SideRays />
      )}
    </div>
  );
}