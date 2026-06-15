"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Cpu, Wifi, WifiOff, RefreshCw, Activity, X, ChevronDown, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api/config";
import { http } from "@/lib/api/http";

interface Device {
  sn: string;
  created_at: string;
  created_at_local: string;
  last_report?: string;
  last_report_local?: string;
  is_online: boolean;
  is_today_new: boolean;
}

interface DeviceSession {
  uuid: string;
  start_time: string;
  end_time: string;
  max_runtime_seconds: number;
  created_at: string;
  start_time_local: string;
  end_time_local: string;
  created_at_local: string;
}

interface DeviceListResponse {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  today_new_devices: number;
  devices: Device[];
}

interface OnlineHistoryResponse {
  device_sn: string;
  total_sessions_found: number;
  requested_count: number;
  records: DeviceSession[];
}

export default function DeviceStats() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [error, setError] = useState("");

  // Stats from backend
  const [totalDevices, setTotalDevices] = useState(0);
  const [onlineDevices, setOnlineDevices] = useState(0);
  const [offlineDevices, setOfflineDevices] = useState(0);
  const [todayNewDevices, setTodayNewDevices] = useState(0);

  // Modal state
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceHistory, setDeviceHistory] = useState<DeviceSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyCount, setHistoryCount] = useState(20);
  const [chartMode, setChartMode] = useState<"top10" | "recent">("top10");

  const fetchDevices = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await http.get<DeviceListResponse>(API_ENDPOINTS.devices.list);

      if (result.success && result.data) {
        const responseData = (result.data as any);
        const deviceList = responseData?.data?.devices || [];
        setDevices(deviceList);
        setFilteredDevices(deviceList);
        setTotalDevices(responseData?.data?.total_devices || deviceList.length);
        setOnlineDevices(responseData?.data?.online_devices || 0);
        setOfflineDevices(responseData?.data?.offline_devices || 0);
        setTodayNewDevices(responseData?.data?.today_new_devices || 0);
        setLastUpdate(new Date().toLocaleTimeString("zh-CN"));
      } else {
        setError(result.error || "获取设备列表失败");
      }
    } catch (err) {
      setError("获取设备列表失败");
      console.error("Fetch devices error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceHistory = async (sn: string, count: number = 20) => {
    setHistoryLoading(true);
    try {
      const result = await http.post<OnlineHistoryResponse>(API_ENDPOINTS.devices.onlineHistory, {
        device_sn: sn,
        number: count,
      });

      if (result.success && result.data) {
        const responseData = (result.data as any);
        setDeviceHistory(responseData?.data?.records || []);
      } else {
        setDeviceHistory([]);
      }
    } catch (err) {
      console.error("Fetch device history error:", err);
      setDeviceHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDevices(devices);
    } else {
      const filtered = devices.filter((device) =>
        device.sn.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDevices(filtered);
    }
  }, [searchQuery, devices]);

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
    fetchDeviceHistory(device.sn, historyCount);
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "0秒";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    }
    return `${secs}秒`;
  };

  const formatDurationHMS = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate stats for selected device
  const totalRuntime = deviceHistory.reduce((acc, s) => acc + (s.max_runtime_seconds || 0), 0);
  const avgRuntime = deviceHistory.length > 0 ? Math.floor(totalRuntime / deviceHistory.length) : 0;
  const maxRuntime = deviceHistory.length > 0 ? Math.max(...deviceHistory.map(s => s.max_runtime_seconds || 0)) : 0;
  const minRuntime = deviceHistory.length > 0 ? Math.min(...deviceHistory.map(s => s.max_runtime_seconds || 0)) : 0;

  // Chart data - based on chartMode
  const chartData = (() => {
    if (chartMode === "top10") {
      // Top 10: 按运行时长排序
      return [...deviceHistory]
        .sort((a, b) => (b.max_runtime_seconds || 0) - (a.max_runtime_seconds || 0))
        .slice(0, 10)
        .map((s, i) => ({
          label: `#${i + 1}`,
          value: s.max_runtime_seconds || 0,
          time: s.start_time_local?.split(" ")[1] || s.start_time_local || "",
        }));
    } else {
      // Recent 10: 按时间倒序（最新的在前）
      return [...deviceHistory]
        .slice(0, 10)
        .map((s, i) => ({
          label: `#${i + 1}`,
          value: s.max_runtime_seconds || 0,
          time: s.start_time_local?.split(" ")[1] || s.start_time_local || "",
        }));
    }
  })();

  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  // Mock trend data
  const trendData = [
    { time: "00:00", value: 1200 },
    { time: "04:00", value: 800 },
    { time: "08:00", value: 2000 },
    { time: "12:00", value: 1800 },
    { time: "16:00", value: 2400 },
    { time: "20:00", value: 1600 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">设备管理</h2>
          <p className="text-sm text-muted-foreground mt-1">
            最后更新: {lastUpdate || "加载中..."}
          </p>
        </div>
        <button
          onClick={fetchDevices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          刷新
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Cpu className="size-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">设备总数</p>
              <p className="text-3xl font-bold">{totalDevices}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Wifi className="size-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">在线设备</p>
              <p className="text-3xl font-bold">{onlineDevices}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <WifiOff className="size-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">离线设备</p>
              <p className="text-3xl font-bold">{offlineDevices}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Activity className="size-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">今日新增</p>
              <p className="text-3xl font-bold">{todayNewDevices}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Device List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-card border border-border/50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">设备列表</h3>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {filteredDevices.length}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索设备..."
              className="w-48 h-9 pl-9 pr-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-500/10 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-accent/30 text-xs font-medium text-muted-foreground">
          <div className="col-span-5">设备序列号</div>
          <div className="col-span-4">创建时间</div>
          <div className="col-span-2 text-center">状态</div>
          <div className="col-span-1 text-right">详情</div>
        </div>

        {/* Table Body */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading && devices.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <RefreshCw className="size-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">加载中...</p>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <p className="text-sm">{searchQuery ? "未找到匹配的设备" : "暂无设备数据"}</p>
            </div>
          ) : (
            filteredDevices.map((device, index) => (
              <motion.div
                key={device.sn}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleDeviceClick(device)}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-accent/30 cursor-pointer transition-colors border-b border-border/30 last:border-b-0"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Cpu className="size-4 text-primary" />
                  </div>
                  <span className="font-mono text-sm font-medium truncate">{device.sn}</span>
                </div>
                <div className="col-span-4 text-sm text-muted-foreground">
                  {device.created_at_local || device.created_at}
                </div>
                <div className="col-span-2 flex items-center justify-center gap-1.5">
                  <div className={`size-2 rounded-full ${device.is_online ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                  <span className={`text-xs ${device.is_online ? "text-green-500" : "text-red-500"}`}>
                    {device.is_online ? "在线" : "离线"}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <div className="size-7 rounded-md bg-accent/50 flex items-center justify-center hover:bg-primary/20 transition-colors group-hover:bg-primary/10">
                    <ChevronDown className="size-4 text-muted-foreground rotate-[-90deg]" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Device Detail Modal */}
      <AnimatePresence>
        {selectedDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedDevice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Cpu className="size-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-mono">{selectedDevice.sn}</h2>
                    <p className="text-sm text-muted-foreground">
                      设备详情 & 运行记录
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={historyCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setHistoryCount(count);
                      fetchDeviceHistory(selectedDevice.sn, count);
                    }}
                    className="h-10 px-3 rounded-lg bg-accent/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value={10}>最近10条</option>
                    <option value={20}>最近20条</option>
                    <option value={50}>最近50条</option>
                    <option value={100}>最近100条</option>
                  </select>
                  <button
                    onClick={() => fetchDeviceHistory(selectedDevice.sn, historyCount)}
                    disabled={historyLoading}
                    className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`size-5 ${historyLoading ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => setSelectedDevice(null)}
                    className="p-2.5 rounded-lg hover:bg-accent transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-4">
                    <div className="flex items-center gap-2 text-blue-500 text-xs mb-2">
                      <Clock className="size-4" />
                      总运行时长
                    </div>
                    <p className="text-2xl font-bold">{formatDuration(totalRuntime)}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 p-4">
                    <div className="flex items-center gap-2 text-green-500 text-xs mb-2">
                      <TrendingUp className="size-4" />
                      平均运行时长
                    </div>
                    <p className="text-2xl font-bold">{formatDuration(avgRuntime)}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4">
                    <div className="flex items-center gap-2 text-purple-500 text-xs mb-2">
                      <BarChart3 className="size-4" />
                      最长运行时长
                    </div>
                    <p className="text-2xl font-bold">{formatDuration(maxRuntime)}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 p-4">
                    <div className="flex items-center gap-2 text-orange-500 text-xs mb-2">
                      <Activity className="size-4" />
                      最短运行时长
                    </div>
                    <p className="text-2xl font-bold">{formatDuration(minRuntime)}</p>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar Chart - Top Sessions / Recent Sessions */}
                  <div className="rounded-xl bg-gradient-to-br from-card to-accent/20 border border-border/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        {chartMode === "top10" ? "运行时长排行 (Top 10)" : "最近运行时长 (最近10次)"}
                      </h3>
                      <div className="flex rounded-lg bg-accent/50 p-1">
                        <button
                          onClick={() => setChartMode("top10")}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            chartMode === "top10"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Top 10
                        </button>
                        <button
                          onClick={() => setChartMode("recent")}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            chartMode === "recent"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          最近10次
                        </button>
                      </div>
                    </div>
                    {historyLoading ? (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        <RefreshCw className="size-6 animate-spin" />
                      </div>
                    ) : chartData.length === 0 ? (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        暂无数据
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chartData.map((item, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex flex-col">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span className="text-xs text-muted-foreground/70">{item.time}</span>
                              </div>
                              <span className="font-medium text-primary">{formatDurationHMS(item.value)}</span>
                            </div>
                            <div className="h-6 bg-accent/50 rounded-lg overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.value / maxChartValue) * 100}%` }}
                                transition={{ duration: 0.8, delay: index * 0.05 }}
                                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-lg"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Line Chart - Trend */}
                  <div className="rounded-xl bg-gradient-to-br from-card to-accent/20 border border-border/50 p-6">
                    <h3 className="text-lg font-semibold mb-4">运行时长趋势</h3>
                    <div className="relative h-[250px]">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground pb-6">
                        <span>3000s</span>
                        <span>2000s</span>
                        <span>1000s</span>
                        <span>0s</span>
                      </div>
                      {/* Chart area */}
                      <div className="absolute left-10 right-0 top-0 bottom-6">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="border-t border-border/30" />
                          ))}
                        </div>
                        {/* Line chart SVG */}
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <motion.path
                            d="M0,80 L16.6,60 L33.3,40 L50,50 L66.6,20 L83.3,55 L100,65"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5 }}
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgb(139, 92, 246)" />
                              <stop offset="100%" stopColor="rgb(59, 130, 246)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        {/* X-axis labels */}
                        <div className="absolute left-0 right-0 bottom-0 flex justify-between text-xs text-muted-foreground">
                          {trendData.map((d, i) => (
                            <span key={i}>{d.time}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="rounded-xl bg-gradient-to-br from-card to-accent/20 border border-border/50 overflow-hidden">
                  <div className="p-4 border-b border-border/50">
                    <h3 className="text-lg font-semibold">运行记录详情</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-accent/30">
                        <tr className="text-left text-xs text-muted-foreground">
                          <th className="px-4 py-3 font-medium">#</th>
                          <th className="px-4 py-3 font-medium">开始时间</th>
                          <th className="px-4 py-3 font-medium">结束时间</th>
                          <th className="px-4 py-3 font-medium">运行时长</th>
                          <th className="px-4 py-3 font-medium">会话ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {historyLoading ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                              <RefreshCw className="size-6 animate-spin mx-auto" />
                            </td>
                          </tr>
                        ) : deviceHistory.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                              暂无运行记录
                            </td>
                          </tr>
                        ) : (
                          deviceHistory.map((session, index) => (
                            <tr key={session.uuid || index} className="hover:bg-accent/20 transition-colors">
                              <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                              <td className="px-4 py-3 text-sm">{session.start_time_local || "N/A"}</td>
                              <td className="px-4 py-3 text-sm">{session.end_time_local || "N/A"}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium">
                                  {formatDuration(session.max_runtime_seconds)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                                {session.uuid?.slice(0, 16) || "N/A"}...
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
