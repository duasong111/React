"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Cpu, Wifi, WifiOff, Activity, ArrowUpRight, ArrowDownRight, TrendingUp, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { API_ENDPOINTS } from "@/lib/api/config";
import { http } from "@/lib/api/http";

interface Device {
  sn: string;
  created_at: string;
  created_at_local: string;
  last_report_local?: string;
  is_online: boolean;
  is_today_new: boolean;
}

interface ContributionDay {
  date: string;
  count: number;
}

interface DeviceListResponse {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  today_new_devices: number;
  devices: Device[];
}

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

export default function DashboardPage() {
  const [username, setUsername] = useState<string>("");
  const [avatarFilename, setAvatarFilename] = useState<string | null>(null);
  const [updatedTime, setUpdatedTime] = useState<string | null>(null);
  const [createdTime, setCreatedTime] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    todayNew: 0,
  });
  const [recentDevices, setRecentDevices] = useState<Device[]>([]);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

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
    const fetchData = async () => {
      try {
        // Fetch device stats
        const result = await http.get<DeviceListResponse>(API_ENDPOINTS.devices.list);
        if (result.success && result.data) {
          const responseData = (result.data as any);
          setStats({
            total: responseData?.data?.total_devices || 0,
            online: responseData?.data?.online_devices || 0,
            offline: responseData?.data?.offline_devices || 0,
            todayNew: responseData?.data?.today_new_devices || 0,
          });
          const devices = responseData?.data?.devices || [];
          setRecentDevices(devices.slice(0, 5));
        }

        // Fetch user contributions with selected month
        const contribResult = await http.post(API_ENDPOINTS.users.contributions, {
          username,
          month: selectedMonth,
        });
        if (contribResult.success && contribResult.data) {
          const contribData = (contribResult.data as any);
          setContributions(contribData?.data?.contributions || []);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username, selectedMonth]);

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 2, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  const formatMonthLabel = (month: string) => {
    const [year, m] = month.split("-");
    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    return `${year}年${monthNames[parseInt(m) - 1]}`;
  };

  // GitHub-style contribution graph
  const getContributionColor = (count: number, max: number) => {
    if (count === 0) return "bg-accent/30";
    const intensity = count / max;
    if (intensity < 0.25) return "bg-green-200 dark:bg-green-800";
    if (intensity < 0.5) return "bg-green-300 dark:bg-green-700";
    if (intensity < 0.75) return "bg-green-400 dark:bg-green-600";
    return "bg-green-500 dark:bg-green-500";
  };

  const maxContribution = Math.max(...contributions.map((c) => c.count), 1);

  // Group contributions by week (last 12 weeks)
  const weeks: ContributionDay[][] = [];
  const sortedContributions = [...contributions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 0; i < 12; i++) {
    const week: ContributionDay[] = [];
    for (let j = 0; j < 7; j++) {
      const idx = i * 7 + j;
      if (idx < sortedContributions.length) {
        week.push(sortedContributions[idx]);
      } else {
        week.push({ date: "", count: 0 });
      }
    }
    weeks.push(week);
  }

  const totalContributions = contributions.reduce((acc, c) => acc + c.count, 0);

  if (!username) return null;

  return (
    <DashboardLayout
      username={username}
      avatarFilename={avatarFilename}
      updatedTime={updatedTime}
      createdTime={createdTime}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">欢迎回来, {username}</h1>
            <p className="text-muted-foreground mt-1">这里是您的设备管理仪表盘</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-500 font-medium">设备总数</p>
                <p className="text-4xl font-bold mt-2">{loading ? "-" : stats.total}</p>
              </div>
              <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Cpu className="size-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="size-3 text-green-500" />
              <span className="text-green-500">+{stats.todayNew}</span>
              <span>今日新增</span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-500 font-medium">在线设备</p>
                <p className="text-4xl font-bold mt-2">{loading ? "-" : stats.online}</p>
              </div>
              <div className="size-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Wifi className="size-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span>实时在线</span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-500 font-medium">离线设备</p>
                <p className="text-4xl font-bold mt-2">{loading ? "-" : stats.offline}</p>
              </div>
              <div className="size-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <WifiOff className="size-6 text-red-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowDownRight className="size-3 text-red-500" />
              <span>超过24小时无活动</span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-500 font-medium">API 请求</p>
                <p className="text-4xl font-bold mt-2">{loading ? "-" : totalContributions}</p>
              </div>
              <div className="size-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Activity className="size-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3 text-green-500" />
              <span>共 {contributions.length} 天活跃</span>
            </div>
          </motion.div>
        </div>

        {/* Contribution Graph */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">活跃统计</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {totalContributions} 次请求 / 共 {contributions.length} 天
              </p>
            </div>
          </div>

          {/* Contribution Graph */}
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-[500px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      className={`size-3 rounded-sm ${day.date ? getContributionColor(day.count, maxContribution) : "bg-transparent"}`}
                      title={day.date ? `${day.date}: ${day.count} 次` : ""}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>少</span>
              <div className="flex gap-1">
                <div className="size-3 rounded-sm bg-accent/30" />
                <div className="size-3 rounded-sm bg-green-200 dark:bg-green-800" />
                <div className="size-3 rounded-sm bg-green-300 dark:bg-green-700" />
                <div className="size-3 rounded-sm bg-green-400 dark:bg-green-600" />
                <div className="size-3 rounded-sm bg-green-500 dark:bg-green-500" />
              </div>
              <span>多</span>
            </div>
            {/* Month Selector */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={handlePrevMonth}
                className="px-2 py-1 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                &lt;
              </button>
              <span className="px-3 py-1 font-medium">{formatMonthLabel(selectedMonth)}</span>
              <button
                onClick={handleNextMonth}
                className="px-2 py-1 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Devices */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">最近设备</h2>
            <a href="/dashboard/devices" className="text-sm text-primary hover:underline">
              查看全部
            </a>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
                <RefreshCw className="size-4 animate-spin" />
                加载中...
              </div>
            ) : recentDevices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无设备</div>
            ) : (
              recentDevices.map((device) => (
                <div
                  key={device.sn}
                  className="flex items-center justify-between p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-3 rounded-full ${device.is_online ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                    <div>
                      <p className="font-medium font-mono text-sm">{device.sn}</p>
                      <p className="text-xs text-muted-foreground">
                        最后活跃: {device.last_report_local || "从未"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${device.is_online ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                      {device.is_online ? "在线" : "离线"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
