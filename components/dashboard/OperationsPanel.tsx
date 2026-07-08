"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Server, Upload, CheckCircle, XCircle, Loader2, Terminal, Zap, Globe, Clock, Power } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api/config";
import { http } from "@/lib/api/http";
import MagicBento from "@/components/MagicBento";

interface BatchDeployResult {
  ip: string;
  status: string;
  detail: string;
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

export default function OperationsPanel() {
  // License state
  const [deviceIp, setDeviceIp] = useState("");
  const [password, setPassword] = useState("");
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [licenseResult, setLicenseResult] = useState<{ success: boolean; message: string } | null>(null);

  // Batch deploy state
  const [ipList, setIpList] = useState("");
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    total: number;
    success_count: number;
    fail_count: number;
    results: BatchDeployResult[];
  } | null>(null);

  // FRP deploy state
  const [frpIp, setFrpIp] = useState("");
  const [frpPassword, setFrpPassword] = useState("");
  const [frpDeviceName, setFrpDeviceName] = useState("");
  const [frpLoading, setFrpLoading] = useState(false);
  const [frpResult, setFrpResult] = useState<{ success: boolean; message: string } | null>(null);

  // Duration deploy state
  const [durationIp, setDurationIp] = useState("");
  const [durationPassword, setDurationPassword] = useState("");
  const [durationSn, setDurationSn] = useState("");
  const [durationUseFrp, setDurationUseFrp] = useState(false);
  const [durationLoading, setDurationLoading] = useState(false);
  const [durationResult, setDurationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Duration status state
  const [statusIp, setStatusIp] = useState("");
  const [statusPassword, setStatusPassword] = useState("");
  const [statusEnable, setStatusEnable] = useState(true);
  const [statusUseFrp, setStatusUseFrp] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleAddLicense = async () => {
    if (!deviceIp || !password) return;
    setLicenseLoading(true);
    setLicenseResult(null);
    try {
      const result = await http.post(API_ENDPOINTS.operations.addLicense, {
        device_ip: deviceIp,
        password: password,
      });
      const responseData = (result.data as any);
      setLicenseResult({
        success: result.success,
        message: responseData?.message || result.error || "操作完成",
      });
    } catch (err) {
      setLicenseResult({ success: false, message: "请求失败" });
    } finally {
      setLicenseLoading(false);
    }
  };

  const handleBatchDeploy = async () => {
    if (!ipList.trim()) return;
    const ips = ipList.split("\n").filter((ip) => ip.trim());
    if (ips.length === 0) return;

    setBatchLoading(true);
    setBatchResult(null);
    try {
      const result = await http.post(API_ENDPOINTS.operations.batchDeploy, { ip_list: ips });
      const responseData = (result.data as any);
      if (result.success) {
        setBatchResult(responseData?.data || {
          total: ips.length,
          success_count: 0,
          fail_count: 0,
          results: [],
        });
      } else {
        setBatchResult({
          total: ips.length,
          success_count: 0,
          fail_count: ips.length,
          results: [{ ip: "N/A", status: "失败", detail: responseData?.message || "操作失败" }],
        });
      }
    } catch (err) {
      setBatchResult({
        total: ips.length,
        success_count: 0,
        fail_count: ips.length,
        results: [{ ip: "N/A", status: "失败", detail: "请求失败" }],
      });
    } finally {
      setBatchLoading(false);
    }
  };

  const handleAddFrp = async () => {
    if (!frpIp || !frpPassword || !frpDeviceName) return;
    setFrpLoading(true);
    setFrpResult(null);
    try {
      const result = await http.post(API_ENDPOINTS.operations.addFrp, {
        ip: frpIp,
        password: frpPassword,
        device_name: frpDeviceName,
      });
      const responseData = (result.data as any);
      setFrpResult({
        success: result.success,
        message: responseData?.message || result.error || "操作完成",
      });
    } catch (err) {
      setFrpResult({ success: false, message: "请求失败" });
    } finally {
      setFrpLoading(false);
    }
  };

  const handleAddDuration = async () => {
    if (!durationIp || !durationPassword || !durationSn) return;
    setDurationLoading(true);
    setDurationResult(null);
    try {
      const result = await http.post(API_ENDPOINTS.operations.addDuration, {
        ip: durationIp,
        password: durationPassword,
        device_sn: durationSn,
        use_frp: durationUseFrp,
      });
      const responseData = (result.data as any);
      setDurationResult({
        success: result.success,
        message: responseData?.message || result.error || "操作完成",
      });
    } catch (err) {
      setDurationResult({ success: false, message: "请求失败" });
    } finally {
      setDurationLoading(false);
    }
  };

  const handleDurationStatus = async (enable: boolean) => {
    if (!statusIp || !statusPassword) return;
    setStatusLoading(true);
    setStatusResult(null);
    try {
      const result = await http.post(API_ENDPOINTS.operations.durationStatus, {
        ip: statusIp,
        password: statusPassword,
        enable,
        use_frp: statusUseFrp,
      });
      const responseData = (result.data as any);
      setStatusResult({
        success: result.success,
        message: responseData?.message || result.error || "操作完成",
      });
    } catch (err) {
      setStatusResult({ success: false, message: "请求失败" });
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">便捷操作</h1>
          <p className="text-muted-foreground mt-1">快速执行设备管理和批量操作</p>
        </div>
      </motion.div>

      {/* Magic Bento Grid with operation cards */}
      <div className="bento-section">
        <MagicBento
          textAutoHide={true}
          enableStars
          enableSpotlight={false}
          enableBorderGlow={true}
          enableTilt
          enableMagnetism
          clickEffect={false}
          spotlightRadius={670}
          particleCount={12}
          glowColor="132, 0, 255"
          disableAnimations={false}
        >
          {/* Card 1 - Add License */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Server className="size-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">添加授权文件</h2>
                <p className="text-sm text-muted-foreground">为指定设备部署授权文件</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">设备 IP 地址</label>
                <input
                  type="text"
                  value={deviceIp}
                  onChange={(e) => setDeviceIp(e.target.value)}
                  placeholder="例如: 192.168.1.100"
                  className="w-full h-10 px-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Root 密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full h-10 px-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <button
                onClick={handleAddLicense}
                disabled={licenseLoading || !deviceIp || !password}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {licenseLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    部署中...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    开始部署
                  </>
                )}
              </button>

              {licenseResult && (
                <div
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    licenseResult.success
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {licenseResult.success ? (
                    <CheckCircle className="size-5 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="size-5 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {licenseResult.success ? "部署成功" : "部署失败"}
                    </p>
                    <p className="text-xs mt-1 opacity-80">{licenseResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 2 - Batch Deploy */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Terminal className="size-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">批量部署</h2>
                <p className="text-sm text-muted-foreground">批量部署 SSH 配置到多台设备</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">IP 列表（每行一个）</label>
                <textarea
                  value={ipList}
                  onChange={(e) => setIpList(e.target.value)}
                  placeholder={`例如:\n192.168.1.100\n192.168.1.101\n192.168.1.102`}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none font-mono"
                />
              </div>
              <button
                onClick={handleBatchDeploy}
                disabled={batchLoading || !ipList.trim()}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {batchLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    部署中...
                  </>
                ) : (
                  <>
                    <Zap className="size-4" />
                    开始批量部署
                  </>
                )}
              </button>

              {batchResult && (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-1 p-3 rounded-lg bg-green-500/10 text-center">
                      <p className="text-2xl font-bold text-green-500">{batchResult.success_count}</p>
                      <p className="text-xs text-muted-foreground">成功</p>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-red-500/10 text-center">
                      <p className="text-2xl font-bold text-red-500">{batchResult.fail_count}</p>
                      <p className="text-xs text-muted-foreground">失败</p>
                    </div>
                  </div>
                  <div className="max-h-[150px] overflow-y-auto space-y-1">
                    {batchResult.results.map((r, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                          r.status === "成功" ? "bg-green-500/10" : "bg-red-500/10"
                        }`}
                      >
                        {r.status === "成功" ? (
                          <CheckCircle className="size-3 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="size-3 text-red-500 shrink-0" />
                        )}
                        <span className="font-mono">{r.ip}</span>
                        <span className="text-muted-foreground truncate">{r.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 3 - Deploy FRP Client */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Globe className="size-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">部署 FRP 客户端</h2>
                <p className="text-sm text-muted-foreground">为远程设备部署 FRP 客户端服务</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">设备 IP 地址</label>
                <input
                  type="text"
                  value={frpIp}
                  onChange={(e) => setFrpIp(e.target.value)}
                  placeholder="例如: 192.168.1.100"
                  className="w-full h-10 px-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Root 密码</label>
                <input
                  type="password"
                  value={frpPassword}
                  onChange={(e) => setFrpPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full h-10 px-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">设备名称（FRP 代理标识）</label>
                <input
                  type="text"
                  value={frpDeviceName}
                  onChange={(e) => setFrpDeviceName(e.target.value)}
                  placeholder="例如: jy.JY_001"
                  className="w-full h-10 px-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <button
                onClick={handleAddFrp}
                disabled={frpLoading || !frpIp || !frpPassword || !frpDeviceName}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {frpLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    部署中...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    部署 FRP 客户端
                  </>
                )}
              </button>

              {frpResult && (
                <div
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    frpResult.success
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {frpResult.success ? (
                    <CheckCircle className="size-5 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="size-5 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {frpResult.success ? "部署成功" : "部署失败"}
                    </p>
                    <p className="text-xs mt-1 opacity-80">{frpResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 4 - Deploy Duration Service */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="size-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">部署运行时长服务</h2>
                <p className="text-sm text-muted-foreground">为远程设备部署运行时长上报服务并设为开机自启</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">设备 IP 地址或FRP</label>
                <input
                  type="text"
                  value={durationIp}
                  onChange={(e) => setDurationIp(e.target.value)}
                  placeholder="例如: 192.168.1.100"
                  className="w-full h-10 px-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Root 密码</label>
                <input
                  type="password"
                  value={durationPassword}
                  onChange={(e) => setDurationPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full h-10 px-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">设备序列号</label>
                <input
                  type="text"
                  value={durationSn}
                  onChange={(e) => setDurationSn(e.target.value)}
                  placeholder="例如: YA_GY_3"
                  className="w-full h-10 px-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="durationUseFrp"
                  type="checkbox"
                  checked={durationUseFrp}
                  onChange={(e) => setDurationUseFrp(e.target.checked)}
                  className="size-4 rounded border-border/50 accent-amber-500"
                />
                <label htmlFor="durationUseFrp" className="text-sm text-muted-foreground">
                  通过 FRP 代理连接设备
                </label>
              </div>
              <button
                onClick={handleAddDuration}
                disabled={durationLoading || !durationIp || !durationPassword || !durationSn}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {durationLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    部署中...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    部署运行时长服务
                  </>
                )}
              </button>

              {durationResult && (
                <div
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    durationResult.success
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {durationResult.success ? (
                    <CheckCircle className="size-5 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="size-5 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {durationResult.success ? "部署成功" : "部署失败"}
                    </p>
                    <p className="text-xs mt-1 opacity-80">{durationResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 5 - Duration Status Control */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Power className="size-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">控制运行时长服务</h2>
                <p className="text-sm text-muted-foreground">启用或禁用远程设备 duration_time 服务</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">设备 IP 地址</label>
                <input
                  type="text"
                  value={statusIp}
                  onChange={(e) => setStatusIp(e.target.value)}
                  placeholder="例如: 192.168.1.100"
                  className="w-full h-10 px-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Root 密码</label>
                <input
                  type="password"
                  value={statusPassword}
                  onChange={(e) => setStatusPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full h-10 px-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="statusUseFrp"
                  type="checkbox"
                  checked={statusUseFrp}
                  onChange={(e) => setStatusUseFrp(e.target.checked)}
                  className="size-4 rounded border-border/50 accent-rose-500"
                />
                <label htmlFor="statusUseFrp" className="text-sm text-muted-foreground">
                  通过 FRP 代理连接设备
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDurationStatus(true)}
                  disabled={statusLoading || !statusIp || !statusPassword}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {statusLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="size-4" />
                      启用开机自启
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDurationStatus(false)}
                  disabled={statusLoading || !statusIp || !statusPassword}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {statusLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="size-4" />
                      禁用开机自启
                    </>
                  )}
                </button>
              </div>

              {statusResult && (
                <div
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    statusResult.success
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {statusResult.success ? (
                    <CheckCircle className="size-5 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="size-5 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {statusResult.success ? "操作成功" : "操作失败"}
                    </p>
                    <p className="text-xs mt-1 opacity-80">{statusResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </MagicBento>
      </div>
    </motion.div>
  );
}
