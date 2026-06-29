"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Wifi,
  Clock,
  Bell,
  BarChart3,
  Settings,
  Zap,
  Moon,
  Sun,
  CheckCircle2,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

// 模拟设备数据
const deviceData = {
  deviceId: "DH-2026-XXXX",
  deviceName: "DeviceHub 智能设备",
  onlineTime: "2026-06-28 10:30:00",
  sittingReminder: "45",
  firmwareVersion: "v2.1.0",
  barkEnabled: true,
  barkKey: "xxxxx-xxxxx-xxxxx",
  lastHeartbeat: "2026-06-29 14:32:15",
  status: "online",
  ipAddress: "192.168.1.100",
  macAddress: "AA:BB:CC:DD:EE:FF",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function UserPanel() {
  const [barkEnabled, setBarkEnabled] = useState(deviceData.barkEnabled);
  const [nightMode, setNightMode] = useState(true);
  const [sittingReminder, setSittingReminder] = useState(deviceData.sittingReminder);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 页面标题 */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold">设备信息</h1>
        <p className="text-muted-foreground mt-1">管理和配置您的智能设备</p>
      </motion.div>

      {/* 设备基本信息卡片 */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Cpu className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">设备基本信息</h2>
            <p className="text-sm text-muted-foreground">设备的核心参数和状态</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="size-4 text-primary" />
              <span className="text-sm text-muted-foreground">设备编号</span>
            </div>
            <p className="font-medium">{deviceData.deviceId}</p>
          </div>

          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Wifi className="size-4 text-green-500" />
              <span className="text-sm text-muted-foreground">设备状态</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-green-500">在线</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="size-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">上线时间</span>
            </div>
            <p className="font-medium">{deviceData.onlineTime}</p>
          </div>

          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="size-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">最后心跳</span>
            </div>
            <p className="font-medium">{deviceData.lastHeartbeat}</p>
          </div>

          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="size-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">固件版本</span>
            </div>
            <p className="font-medium">{deviceData.firmwareVersion}</p>
          </div>

          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="size-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">IP 地址</span>
            </div>
            <p className="font-medium">{deviceData.ipAddress}</p>
          </div>

          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="size-4 text-cyan-500" />
              <span className="text-sm text-muted-foreground">MAC 地址</span>
            </div>
            <p className="font-medium">{deviceData.macAddress}</p>
          </div>

          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="size-4 text-pink-500" />
              <span className="text-sm text-muted-foreground">久坐提醒</span>
            </div>
            <p className="font-medium">{sittingReminder} 分钟</p>
          </div>
        </div>
      </motion.div>

      {/* 数据图表 */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <BarChart3 className="size-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">数据图表</h2>
            <p className="text-sm text-muted-foreground">设备使用数据和趋势分析</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-6 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">今日久坐时长</span>
              <Moon className="size-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">3h 24m</p>
            <div className="mt-4 h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-blue-500 rounded-full" />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">活动时长</span>
              <Sun className="size-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold">1h 12m</p>
            <div className="mt-4 h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-orange-500 rounded-full" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-accent/50 border border-border/50">
          <h4 className="text-sm font-medium mb-4">本周数据趋势</h4>
          <div className="flex items-end justify-between h-32 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const heights = [60, 75, 45, 80, 55, 40, 65];
              return (
                <div key={day} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full bg-primary/20 rounded-t"
                    style={{ height: `${heights[i]}%` }}
                  >
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${heights[i] * 0.7}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 设备控制 */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Settings className="size-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">设备控制</h2>
            <p className="text-sm text-muted-foreground">配置设备的工作模式和参数</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3">
              <Moon className="size-5 text-blue-500" />
              <div>
                <p className="font-medium">夜间模式</p>
                <p className="text-sm text-muted-foreground">自动调节屏幕</p>
              </div>
            </div>
            <Switch checked={nightMode} onCheckedChange={setNightMode} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3">
              <Bell className="size-5 text-orange-500" />
              <div>
                <p className="font-medium">久坐提醒</p>
                <p className="text-sm text-muted-foreground">间隔 {sittingReminder} 分钟</p>
              </div>
            </div>
            <input
              type="number"
              value={sittingReminder}
              onChange={(e) => setSittingReminder(e.target.value)}
              className="w-16 px-2 py-1 text-center rounded-lg bg-background border border-border/50"
              min="1"
              max="120"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center gap-3">
              <Zap className="size-5 text-yellow-500" />
              <div>
                <p className="font-medium">设备重启</p>
                <p className="text-sm text-muted-foreground">应用更改</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm">
              重启
            </button>
          </div>
        </div>
      </motion.div>

      {/* 固件管理 */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Zap className="size-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">固件管理</h2>
            <p className="text-sm text-muted-foreground">设备固件的版本和更新</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">当前版本</p>
                <p className="text-sm text-muted-foreground mt-1">{deviceData.firmwareVersion}</p>
              </div>
              <CheckCircle2 className="size-5 text-green-500" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">检查更新</p>
                <p className="text-sm text-muted-foreground mt-1">已是最新版本</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm">
                检查
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-6 rounded-xl border-2 border-dashed border-border/50 text-center">
          <Zap className="size-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">手动更新固件</p>
          <p className="text-sm text-muted-foreground mb-4">上传 .bin 文件进行固件升级</p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
            选择文件
          </button>
        </div>
      </motion.div>

      {/* Bark 通知 */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
            <Bell className="size-5 text-pink-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Bark 通知</h2>
            <p className="text-sm text-muted-foreground">设备推送通知设置</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50 border border-border/50 mb-4">
          <div className="flex items-center gap-3">
            <Bell className="size-5 text-primary" />
            <div>
              <p className="font-medium">启用 Bark 通知</p>
              <p className="text-sm text-muted-foreground">通过 Bark 推送设备提醒</p>
            </div>
          </div>
          <Switch checked={barkEnabled} onCheckedChange={setBarkEnabled} />
        </div>

        {barkEnabled && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Bark Key
              </label>
              <input
                type="text"
                defaultValue={deviceData.barkKey}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="输入您的 Bark Key"
              />
            </div>

            <div className="p-4 rounded-xl bg-accent/50 border border-border/50 space-y-3">
              <p className="text-sm font-medium">通知类型</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">久坐提醒</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">设备上线通知</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">设备离线通知</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">固件更新提醒</span>
                <Switch />
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              保存设置
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}