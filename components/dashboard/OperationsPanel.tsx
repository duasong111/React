"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Server, Upload, CheckCircle, XCircle, Loader2, Terminal, Zap } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api/config";
import { http } from "@/lib/api/http";

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

      {/* Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add License */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6"
        >
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

        {/* Batch Deploy */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6"
        >
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

      </div>
    </motion.div>
  );
}
