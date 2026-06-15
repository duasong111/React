"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsPanel from "@/components/dashboard/SettingsPanel";

export default function SettingsPage() {
  const [username, setUsername] = useState<string>("");
  const [avatarFilename, setAvatarFilename] = useState<string | null>(null);
  const [updatedTime, setUpdatedTime] = useState<string | null>(null);
  const [createdTime, setCreatedTime] = useState<string | null>(null);

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

  if (!username) return null;

  return (
    <DashboardLayout
      username={username}
      avatarFilename={avatarFilename}
      updatedTime={updatedTime}
      createdTime={createdTime}
    >
      <SettingsPanel />
    </DashboardLayout>
  );
}
