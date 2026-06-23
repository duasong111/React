"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, Sun, Moon } from "lucide-react";

const navLinks = [
  { label: "功能", href: "#features" },
  { label: "数据", href: "#stats" },
  { label: "关于", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load initial theme
    const savedSettings = localStorage.getItem("user_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.theme === "dark") {
          setIsDark(true);
        } else if (parsed.theme === "system") {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setIsDark(prefersDark);
        }
      } catch {
        // ignore
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    // Save to localStorage
    const savedSettings = localStorage.getItem("user_settings");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.theme = newIsDark ? "dark" : "light";
    localStorage.setItem("user_settings", JSON.stringify(settings));

    // Apply theme
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newIsDark ? "dark" : "light");

    // Notify other components
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("settings-changed"));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="size-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            珈鹰科技
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors overflow-hidden"
            title={isDark ? "切换到浅色主题" : "切换到深色主题"}
          >
            <motion.div
              animate={{ x: isDark ? 32 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-5 h-5 rounded-full bg-primary shadow-md flex items-center justify-center"
            >
              {isDark ? (
                <Moon className="size-3 text-primary-foreground" />
              ) : (
                <Sun className="size-3 text-primary-foreground" />
              )}
            </motion.div>
          </button>

          <Button size="sm" asChild>
            <a href="/login">开始使用</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
                <span>{isDark ? "深色模式" : "浅色模式"}</span>
              </button>

              <Button size="sm" className="w-fit" asChild>
                <a href="/login">开始使用</a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}