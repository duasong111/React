"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, Calendar, Clock, Activity, LogOut, Lock, Eye, EyeOff, UserCog } from "lucide-react";
import { getAvatarUrl } from "@/lib/api/config";
import { API_ENDPOINTS } from "@/lib/api/config";
import { http } from "@/lib/api/http";

interface UserProfileCardProps {
  username: string;
  avatarFilename?: string | null;
  updatedTime?: string | null;
  createdTime?: string | null;
  onAvatarUploadSuccess?: (filename: string) => void;
  onLogout: () => void;
}

type EditMode = "none" | "avatar" | "password";

export default function UserProfileCard({
  username,
  avatarFilename,
  updatedTime,
  createdTime,
  onAvatarUploadSuccess,
  onLogout,
}: UserProfileCardProps) {
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const avatarUrl = avatarFilename ? getAvatarUrl(avatarFilename) : null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "未知";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("请选择 JPG、PNG、GIF 或 WebP 格式的图片");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("图片大小不能超过 20MB");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload_avatar/`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        const filename = data.data?.filename;
        if (filename && onAvatarUploadSuccess) {
          onAvatarUploadSuccess(filename);
        }
        handleCancel();
      } else {
        setError(data.message || "上传失败");
      }
    } catch (err) {
      setError("上传失败，请重试");
      console.error("Avatar upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("请填写所有字段");
      return;
    }

    if (newPassword.length < 8) {
      setError("新密码长度至少 8 位");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await http.post(API_ENDPOINTS.users.changePassword, {
        username,
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (result.success) {
        setSuccess("密码修改成功！");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          handleCancel();
          onLogout();
        }, 1500);
      } else {
        setError(result.error || "修改失败");
      }
    } catch (err) {
      setError("修改失败，请重试");
      console.error("Password change error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode("none");
    setPreview(null);
    setError("");
    setSuccess("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="size-28 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-primary/20">
            {preview ? (
              <img src={preview} alt="预览" className="size-full object-cover" />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
                <span className="text-3xl font-bold text-white">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Edit Button */}
          {editMode === "none" && (
            <button
              onClick={() => setEditMode("avatar")}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="size-8 text-white" />
            </button>
          )}

          {/* Online Status */}
          <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
            <div className="size-2 rounded-full bg-white" />
          </div>
        </div>

        {/* Username */}
        <p className="mt-4 text-lg font-semibold">{username}</p>
      </div>

      {/* User Info */}
      <div className="bg-accent/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">注册时间</p>
            <p className="text-sm font-medium">{formatDate(createdTime)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">最后更新</p>
            <p className="text-sm font-medium">{formatDate(updatedTime)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Activity className="size-4 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">状态</p>
            <p className="text-sm font-medium text-green-500">在线</p>
          </div>
        </div>
      </div>

      {/* Avatar Upload Panel */}
      <AnimatePresence>
        {editMode === "avatar" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl border border-border/50 p-4 space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">选择新头像</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium file:cursor-pointer hover:file:bg-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                支持 JPG、PNG、GIF、WebP 格式，最大 20MB
              </p>
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-sm font-medium"
              >
                <X className="size-4" />
                取消
              </button>
              <button
                onClick={handleAvatarUpload}
                disabled={loading || !fileInputRef.current?.files?.[0]}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {loading ? (
                  "上传中..."
                ) : (
                  <>
                    <Check className="size-4" />
                    保存
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Panel */}
      <AnimatePresence>
        {editMode === "password" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl border border-border/50 p-4 space-y-4"
          >
            <div className="space-y-3">
              {/* Old Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">旧密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="请输入旧密码"
                    className="w-full pl-10 pr-10 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showOldPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码（至少8位）"
                    className="w-full pl-10 pr-10 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">确认新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                    className="w-full pl-10 pr-10 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            {success && <p className="text-sm text-green-500 text-center">{success}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-sm font-medium"
              >
                <X className="size-4" />
                取消
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {loading ? "处理中..." : "确认修改"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {editMode === "none" && (
        <div className="space-y-2">
          <button
            onClick={() => setEditMode("password")}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-sm font-medium"
          >
            <UserCog className="size-4" />
            修改密码
          </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="size-4" />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
