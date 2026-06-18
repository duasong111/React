"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, RefreshCw, CheckCircle, XCircle, Loader2, Search, X, Wifi, WifiOff, Trash2, Save, Plus, Pencil } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api/config";
import { http } from "@/lib/api/http";

interface FRPDevice {
  host: string;
  query_time: string;
  query_time_local: string;
  uptime: string;
  uptime_s: string;
  [key: string]: string;
}

interface ConfigResult {
  success: boolean;
  message: string;
}

export default function FRPDeviceManager() {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<FRPDevice[]>([]);
  const [totalDevices, setTotalDevices] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<FRPDevice | null>(null);
  const [modalResult, setModalResult] = useState<ConfigResult | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [devicePassword, setDevicePassword] = useState("");
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  const fetchDevices = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await http.post(API_ENDPOINTS.operations.frpUptime, { number: 50 });
      if (result.success && result.data) {
        const responseData = result.data as Record<string, any>;
        setDevices(responseData?.data?.records || []);
        setTotalDevices(responseData?.data?.total_devices || 0);
      } else {
        setError(result.error || "获取设备列表失败");
      }
    } catch (err) {
      setError("获取设备列表失败");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleOpenModal = (device: FRPDevice) => {
    setSelectedDevice(device);
    setEditingField(null);
    setEditValue("");
    setModalResult(null);
    setShowModal(true);
    setShowAddField(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDevice(null);
    setEditingField(null);
    setEditValue("");
    setModalResult(null);
    setShowAddField(false);
  };

  const handleStartEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSaveEdit = () => {
    if (!selectedDevice || !editingField) return;
    setModalResult({ success: true, message: "已保存: " + editingField + " = " + editValue });
    setEditingField(null);
  };

  const handleDeleteField = (field: string) => {
    if (!selectedDevice) return;
    setModalResult({ success: true, message: "已删除字段: " + field });
  };

  const handleAddField = () => {
    if (!selectedDevice || !newFieldKey.trim()) return;
    setModalResult({ success: true, message: "已添加字段: " + newFieldKey });
    setNewFieldKey("");
    setNewFieldValue("");
    setShowAddField(false);
  };

  const handleDeleteDevice = () => {
    if (!selectedDevice) return;
    setModalResult({ success: true, message: "已删除设备: " + selectedDevice.host });
  };

  const handleQuery = async () => {
    if (!selectedDevice) return;
    setQueryLoading(true);
    setModalResult(null);
    try {
      const result = await http.post(API_ENDPOINTS.operations.frpUptime, {
        number: 50,
        host: selectedDevice.host,
        password: devicePassword,
      });
      if (result.success && result.data) {
        const responseData = result.data as Record<string, any>;
        const records = responseData?.data?.records || [];
        if (records.length > 0) {
          setDevices(records);
          setModalResult({ success: true, message: "查询成功，已更新设备信息" });
        } else {
          setModalResult({ success: false, message: "未找到设备 " + selectedDevice.host });
        }
      } else {
        setModalResult({ success: false, message: result.error || "查询失败" });
      }
    } catch (err) {
      setModalResult({ success: false, message: "查询请求失败" });
    } finally {
      setQueryLoading(false);
    }
  };

  const filteredDevices = devices.filter((d) =>
    d.host.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultFields: { key: keyof FRPDevice; label: string }[] = [
    { key: "host", label: "设备编号" },
    { key: "uptime", label: "运行状态" },
    { key: "uptime_s", label: "运行时长(秒)" },
    { key: "query_time", label: "查询时间" },
    { key: "query_time_local", label: "本地查询时间" },
  ];

  const getDeviceFields = (device: FRPDevice) => {
    const fields: { key: string; label: string; isDefault: boolean }[] = defaultFields.map(f => ({
      key: String(f.key),
      label: f.label,
      isDefault: true,
    }));
    Object.keys(device).forEach(key => {
      if (!defaultFields.find(f => String(f.key) === key)) {
        fields.push({ key, label: key, isDefault: false });
      }
    });
    return fields;
  };

  return (
    <>
      <motion.div
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Server className="size-5 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">FRP 设备管理</h2>
              <p className="text-sm text-muted-foreground">查询和配置 FRP 设备</p>
            </div>
          </div>
          <button
            onClick={fetchDevices}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={"size-4 " + (loading ? "animate-spin" : "")} />
            刷新
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索设备..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Loader2 className="size-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">加载中...</p>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm">暂无设备</div>
          ) : (
            filteredDevices.map((device) => (
              <button
                key={device.host}
                onClick={() => handleOpenModal(device)}
                className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 border border-border/30 transition-all text-left"
              >
                <div
                  className={"size-8 rounded-lg flex items-center justify-center shrink-0 " + (device.uptime === "连接不到 FRP 代理" ? "bg-red-500/10" : "bg-green-500/10")}
                >
                  {device.uptime === "连接不到 FRP 代理" ? (
                    <WifiOff className="size-4 text-red-500" />
                  ) : (
                    <Wifi className="size-4 text-green-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{device.host}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {device.uptime === "连接不到 FRP 代理" ? "离线" : "在线"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-border/50 text-sm text-muted-foreground">
          共 {filteredDevices.length} / {totalDevices} 台设备
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && selectedDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-2xl h-[550px] flex overflow-hidden"
            >
              {/* 左侧：设备列表 */}
              <div className="w-48 border-r border-border/50 flex flex-col">
                <div className="p-3 border-b border-border/50">
                  <h3 className="text-sm font-medium">设备列表</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {devices.map((device) => (
                    <button
                      key={device.host}
                      onClick={() => {
                        setSelectedDevice(device);
                        setEditingField(null);
                        setModalResult(null);
                        setShowAddField(false);
                      }}
                      className={"w-full text-left px-2 py-1.5 rounded-lg text-xs truncate transition-colors " + (device.host === selectedDevice.host ? "bg-primary/20 text-primary" : "hover:bg-accent/50")}
                    >
                      {device.host}
                    </button>
                  ))}
                </div>
              </div>

              {/* 右侧：设备信息 */}
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={"size-10 rounded-xl flex items-center justify-center " + (selectedDevice.uptime === "连接不到 FRP 代理" ? "bg-red-500/10" : "bg-green-500/10")}
                    >
                      {selectedDevice.uptime === "连接不到 FRP 代理" ? (
                        <WifiOff className="size-5 text-red-500" />
                      ) : (
                        <Wifi className="size-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{selectedDevice.host}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedDevice.uptime === "连接不到 FRP 代理" ? "离线" : "在线"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteDevice}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                      title="删除此设备"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <button onClick={handleCloseModal} className="p-2 rounded-lg hover:bg-accent">
                      <X className="size-5" />
                    </button>
                  </div>
                </div>

                {/* 设备信息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  {getDeviceFields(selectedDevice).map(({ key, label, isDefault }) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/30 group"
                    >
                      <span className="w-24 text-sm text-muted-foreground shrink-0">{label}</span>
                      {editingField === key ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 h-8 px-2 rounded bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="p-1.5 rounded bg-green-500/10 hover:bg-green-500/20 text-green-500"
                          >
                            <Save className="size-4" />
                          </button>
                          <button
                            onClick={() => setEditingField(null)}
                            className="p-1.5 rounded bg-accent hover:bg-accent/80"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-sm truncate">{String(selectedDevice[key])}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartEdit(key, String(selectedDevice[key]))}
                              className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary"
                              title="编辑"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteField(key)}
                              className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                              title="删除字段"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* 添加新字段 */}
                  {showAddField ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/30 border border-primary/30">
                      <input
                        type="text"
                        value={newFieldKey}
                        onChange={(e) => setNewFieldKey(e.target.value)}
                        placeholder="字段名"
                        className="w-24 h-8 px-2 rounded bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                      <input
                        type="text"
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        placeholder="字段值"
                        className="flex-1 h-8 px-2 rounded bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={handleAddField}
                        className="p-1.5 rounded bg-green-500/10 hover:bg-green-500/20 text-green-500"
                      >
                        <CheckCircle className="size-4" />
                      </button>
                      <button
                        onClick={() => setShowAddField(false)}
                        className="p-1.5 rounded bg-accent hover:bg-accent/80"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddField(true)}
                      className="flex items-center gap-2 w-full p-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/30 hover:text-primary transition-colors"
                    >
                      <Plus className="size-4" />
                      添加字段
                    </button>
                  )}
                </div>

                {/* 底部操作区 */}
                <div className="p-4 border-t border-border/50 space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Root 密码</label>
                    <input
                      type="password"
                      value={devicePassword}
                      onChange={(e) => setDevicePassword(e.target.value)}
                      placeholder="输入密码以查询最新信息"
                      className="w-full h-10 px-3 rounded-lg bg-accent/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                  </div>

                  {modalResult && (
                    <div
                      className={"p-3 rounded-lg flex items-start gap-2 " + (modalResult.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}
                    >
                      {modalResult.success ? (
                        <CheckCircle className="size-5 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="size-5 shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm">{modalResult.message}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleQuery}
                      disabled={queryLoading}
                      className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50"
                    >
                      {queryLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Search className="size-4" />
                      )}
                      查询
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-4 h-10 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}