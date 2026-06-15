"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Cpu,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Zap
} from "lucide-react";
import UserProfileCard from "./UserProfileCard";
import { getAvatarUrl } from "@/lib/api/config";

interface DashboardLayoutProps {
  children: React.ReactNode;
  username: string;
  avatarFilename?: string | null;
  updatedTime?: string | null;
  createdTime?: string | null;
}

const navItems = [
  { icon: LayoutDashboard, label: "仪表盘", href: "/dashboard", active: true },
  { icon: Cpu, label: "设备管理", href: "/dashboard/devices", active: false },
  { icon: Zap, label: "便捷操作", href: "/dashboard/operations", active: false },
  { icon: Settings, label: "系统设置", href: "/dashboard/settings", active: false },
];

const handleLogout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("username");
  localStorage.removeItem("avatar_filename");
  localStorage.removeItem("updated_time");
  localStorage.removeItem("created_time");
  window.location.href = "/login";
};

export default function DashboardLayout({ children, username, avatarFilename, updatedTime, createdTime }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(avatarFilename || null);
  const pathname = usePathname();

  const handleAvatarUploadSuccess = (filename: string) => {
    setAvatar(filename);
    localStorage.setItem("avatar_filename", filename);
  };

  const avatarUrl = avatar ? getAvatarUrl(avatar) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 z-50">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Logo & Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Cpu className="size-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">DeviceHub</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索设备..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          {/* Right: Notifications & User */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="size-5" />
              <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
            </button>

            {/* User Profile - Click to open avatar editor */}
            <button
              onClick={() => setShowAvatarEditor(true)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 transition-all"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="size-9 rounded-full object-cover ring-2 ring-border/50"
                />
              ) : (
                <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center ring-2 ring-border/50">
                  <span className="text-sm font-bold text-white">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-none">{username}</p>
                <p className="text-xs text-muted-foreground mt-0.5">在线</p>
              </div>
              <ChevronDown className="size-4 text-muted-foreground hidden sm:block" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-card/80 backdrop-blur-xl border-r border-border/50 z-40 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 sm:w-16"
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="size-5 shrink-0" />
                <span className={`text-sm font-medium ${sidebarOpen ? "" : "hidden sm:block"}`}>
                  {item.label}
                </span>
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? "sm:ml-64" : "sm:ml-16"
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Avatar Upload Modal */}
      <AnimatePresence>
        {showAvatarEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAvatarEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border/50 shadow-2xl p-6 w-full max-w-sm mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">用户信息</h3>
                <button
                  onClick={() => setShowAvatarEditor(false)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
              <UserProfileCard
                username={username}
                avatarFilename={avatar}
                updatedTime={updatedTime}
                createdTime={createdTime}
                onAvatarUploadSuccess={handleAvatarUploadSuccess}
                onLogout={handleLogout}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
