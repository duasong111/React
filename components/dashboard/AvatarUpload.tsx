"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check } from "lucide-react";
import { getAvatarUrl } from "@/lib/api/config";

interface AvatarUploadProps {
  username: string;
  currentAvatar?: string | null;
  onUploadSuccess?: (filename: string) => void;
}

export default function AvatarUpload({
  username,
  currentAvatar,
  onUploadSuccess,
}: AvatarUploadProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("请选择 JPG、PNG、GIF 或 WebP 格式的图片");
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setError("图片大小不能超过 20MB");
      return;
    }

    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("file", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload_avatar/`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        const filename = data.data?.filename;
        if (filename && onUploadSuccess) {
          onUploadSuccess(filename);
        }
        setIsEditing(false);
        setPreview(null);
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

  const handleCancel = () => {
    setIsEditing(false);
    setPreview(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const avatarUrl = currentAvatar ? getAvatarUrl(currentAvatar) : null;

  return (
    <div className="flex flex-col items-center">
      {/* Avatar Display/Edit */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          {/* Avatar Image */}
          <div className="size-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-primary/20">
            {preview ? (
              <img
                src={preview}
                alt="预览"
                className="size-full object-cover"
              />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="size-full object-cover"
                onError={(e) => {
                  // Fallback to initials if avatar fails to load
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

          {/* Edit Button Overlay */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="size-8 text-white" />
            </button>
          )}
        </motion.div>

        {/* Status Indicator */}
        <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
          <div className="size-2 rounded-full bg-white" />
        </div>
      </div>

      {/* Edit Mode Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 w-full max-w-xs"
          >
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-4">
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

              {/* Preview */}
              {preview && (
                <div className="flex justify-center">
                  <div className="size-20 rounded-full overflow-hidden border-2 border-primary/30">
                    <img
                      src={preview}
                      alt="预览"
                      className="size-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {/* Actions */}
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
                  onClick={handleUpload}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Username Display */}
      {!isEditing && (
        <div className="mt-4 text-center">
          <p className="font-semibold text-lg">{username}</p>
          <p className="text-sm text-muted-foreground">在线</p>
        </div>
      )}
    </div>
  );
}
