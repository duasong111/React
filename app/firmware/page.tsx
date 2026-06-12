"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Settings,
  Info,
  ChevronDown,
  RefreshCw,
  Wifi,
  Clock,
  Signal,
  Globe
} from 'lucide-react';

interface SerialPortLike {
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  writable: { getWriter: () => WritableStreamDefaultWriter } | null;
  readable: { getReader: () => ReadableStreamDefaultReader } | null;
}

interface PortInfo {
  usbVendorId?: number;
  usbProductId?: number;
  serialNumber?: string;
  manufacturer?: string;
  productId?: string;
  locationId?: string;
}

interface ParsedLog {
  uptime: string;
  wifiStatus: string;
  ip: string;
  rssi: string;
  timestamp: Date;
}

const BAUD_RATES = [
  300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600
];

export default function FirmwareUpload() {
  const [isConnected, setIsConnected] = useState(false);
  const [port, setPort] = useState<SerialPortLike | null>(null);
  const [portInfo, setPortInfo] = useState<PortInfo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [baudRate, setBaudRate] = useState(115200);
  const [showBaudRateDropdown, setShowBaudRateDropdown] = useState(false);
  const [showPortInfo, setShowPortInfo] = useState(false);
  const [serialOutput, setSerialOutput] = useState('');
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  useEffect(() => {
    let keepReading = true;

    const readSerial = async () => {
      if (!port?.readable || !keepReading) return;
      
      readerRef.current = port.readable.getReader();
      
      try {
        while (keepReading) {
          const { value, done } = await readerRef.current.read();
          if (done) break;
          
          const text = new TextDecoder('utf-8').decode(value);
          setSerialOutput(prev => (prev + text).slice(-4000));
        }
      } catch (error) {
        console.log('Serial read stopped:', error);
      } finally {
        if (readerRef.current) {
          try {
            readerRef.current.releaseLock();
          } catch (e) {
            console.log('Error releasing lock:', e);
          }
          readerRef.current = null;
        }
      }
    };

    if (isConnected && !isFlashing) {
      setIsReading(true);
      readSerial();
    }

    return () => {
      keepReading = false;
      setIsReading(false);
    };
  }, [isConnected, isFlashing, port]);

  const parseLogLine = (line: string): ParsedLog | null => {
    const uptimeMatch = line.match(/Uptime:\s*(\d+)\s+seconds?/);
    const wifiMatch = line.match(/WiFi\s+Status:\s*(\w+)/);
    const ipMatch = line.match(/IP:\s*([\d.]+)/);
    const rssiMatch = line.match(/RSSI:\s*(-?\d+)\s+dBm/);

    if (uptimeMatch && wifiMatch && ipMatch && rssiMatch) {
      return {
        uptime: `${uptimeMatch[1]} 秒`,
        wifiStatus: wifiMatch[1],
        ip: ipMatch[1],
        rssi: `${rssiMatch[1]} dBm`,
        timestamp: new Date()
      };
    }
    return null;
  };

  const parsedLogs = useMemo(() => {
    const lines = serialOutput.split('\n').filter(line => line.includes('System Log'));
    const logs: ParsedLog[] = [];
    
    lines.forEach(line => {
      const parsed = parseLogLine(line);
      if (parsed) {
        logs.push(parsed);
      }
    });
    
    return logs.slice(-10);
  }, [serialOutput]);

  const connectToESP32 = async () => {
    try {
      if (!('serial' in navigator)) {
        setStatus('您的浏览器不支持 Web Serial API');
        return;
      }

      const selectedPort = await (navigator as unknown as { 
        serial: { requestPort: () => Promise<SerialPortLike & { getInfo: () => PortInfo }> } 
      }).serial.requestPort();
      
      const info = selectedPort.getInfo?.();
      if (info) {
        setPortInfo(info);
      }
      
      await selectedPort.open({ baudRate });
      setPort(selectedPort);
      setIsConnected(true);
      setSerialOutput('');
      setStatus(`✅ 已连接到设备 - 波特率: ${baudRate}`);
    } catch (error) {
      if ((error as Error).message.includes('The request was canceled')) {
        setStatus('已取消选择设备');
      } else {
        setStatus('❌ 连接失败: ' + (error as Error).message);
      }
    }
  };

  const disconnectFromESP32 = async () => {
    if (port) {
      try {
        if (readerRef.current) {
          try {
            readerRef.current.cancel();
          } catch (e) {
            console.log('Error canceling reader:', e);
          }
          readerRef.current = null;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await port.close();
        setPort(null);
        setPortInfo(null);
        setIsConnected(false);
        setSerialOutput('');
        setStatus('✅ 已断开连接');
      } catch (error) {
        setStatus('断开连接失败: ' + (error as Error).message);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatus(`📁 已选择文件: ${file.name} (${formatFileSize(file.size)})`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const flashFirmware = async () => {
    if (!port || !selectedFile) {
      setStatus('❌ 请先连接设备并选择固件文件');
      return;
    }

    setIsFlashing(true);
    setStatus('🔄 正在准备刷写...');
    setProgress(0);

    try {
      const writer = port.writable?.getWriter();
      if (!writer) {
        throw new Error('无法获取写入器');
      }

      const data = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(data);

      setStatus('📤 正在发送固件数据...');

      const chunkSize = 256;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
        await writer.write(chunk);
        setProgress(Math.round((i / uint8Array.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      await writer.close();
      setStatus('✅ 固件发送完成！');
      setProgress(100);
    } catch (error) {
      setStatus('❌ 刷写失败: ' + (error as Error).message);
    } finally {
      setIsFlashing(false);
    }
  };

  const clearSerialOutput = () => {
    setSerialOutput('');
  };

  const getRssiColor = (rssi: string): string => {
    const value = parseInt(rssi);
    if (value >= -50) return 'text-green-500';
    if (value >= -70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getWifiStatusColor = (status: string): string => {
    return status === 'Connected' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-2xl border border-border/50 shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
              <Terminal className="size-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">ESP32 固件刷写工具</h2>
            <p className="text-muted-foreground mt-2">通过浏览器直接刷写 ESP32 固件</p>
          </div>

          {/* Settings Row - Baud Rate */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              <Settings className="inline size-4 mr-1" />
              波特率设置
            </label>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between h-12"
                onClick={() => setShowBaudRateDropdown(!showBaudRateDropdown)}
                disabled={isConnected}
              >
                <span className="flex items-center gap-2">
                  <Terminal className="size-4" />
                  {baudRate} bps
                </span>
                <ChevronDown className={`size-4 transition-transform ${showBaudRateDropdown ? 'rotate-180' : ''}`} />
              </Button>
              
              {showBaudRateDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {BAUD_RATES.map((rate) => (
                    <button
                      key={rate}
                      className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors ${
                        baudRate === rate ? 'bg-muted font-medium' : ''
                      }`}
                      onClick={() => {
                        setBaudRate(rate);
                        setShowBaudRateDropdown(false);
                      }}
                    >
                      {rate} bps
                      {rate === 115200 && <span className="ml-2 text-xs text-muted-foreground">(推荐)</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Connection Button */}
          <div className="mb-6">
            <Button
              onClick={isConnected ? disconnectFromESP32 : connectToESP32}
              className="w-full flex items-center justify-center gap-2 h-12"
              variant={isConnected ? 'destructive' : 'default'}
              disabled={isFlashing}
            >
              <Terminal className="size-4" />
              {isConnected ? '断开设备' : '连接 ESP32'}
            </Button>
          </div>

          {/* Port Info Dropdown */}
          {isConnected && portInfo && (
            <div className="mb-6">
              <Button
                variant="outline"
                className="w-full justify-between h-12"
                onClick={() => setShowPortInfo(!showPortInfo)}
              >
                <span className="flex items-center gap-2">
                  <Info className="size-4" />
                  设备信息
                </span>
                <ChevronDown className={`size-4 transition-transform ${showPortInfo ? 'rotate-180' : ''}`} />
              </Button>
              
              {showPortInfo && (
                <div className="mt-2 p-4 bg-muted/30 rounded-lg text-sm">
                  <div className="space-y-2">
                    {portInfo.usbVendorId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">USB 厂商ID:</span>
                        <span>0x{portInfo.usbVendorId.toString(16).padStart(4, '0')}</span>
                      </div>
                    )}
                    {portInfo.usbProductId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">USB 产品ID:</span>
                        <span>0x{portInfo.usbProductId.toString(16).padStart(4, '0')}</span>
                      </div>
                    )}
                    {portInfo.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">序列号:</span>
                        <span>{portInfo.serialNumber}</span>
                      </div>
                    )}
                    {portInfo.manufacturer && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">厂商:</span>
                        <span>{portInfo.manufacturer}</span>
                      </div>
                    )}
                    {portInfo.productId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">产品:</span>
                        <span>{portInfo.productId}</span>
                      </div>
                    )}
                    {portInfo.locationId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">位置ID:</span>
                        <span>{portInfo.locationId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Parsed Logs Display */}
          {isConnected && !isFlashing && parsedLogs.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-muted-foreground">
                  📊 系统状态（实时）
                </label>
              </div>
              
              {/* Latest Status Card */}
              {parsedLogs[parsedLogs.length - 1] && (
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">运行时间</div>
                        <div className="font-medium">{parsedLogs[parsedLogs.length - 1].uptime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className={`size-4 ${getWifiStatusColor(parsedLogs[parsedLogs.length - 1].wifiStatus)}`} />
                      <div>
                        <div className="text-xs text-muted-foreground">WiFi状态</div>
                        <div className={`font-medium ${getWifiStatusColor(parsedLogs[parsedLogs.length - 1].wifiStatus)}`}>
                          {parsedLogs[parsedLogs.length - 1].wifiStatus}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="size-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">IP地址</div>
                        <div className="font-medium font-mono text-sm">{parsedLogs[parsedLogs.length - 1].ip}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Signal className={`size-4 ${getRssiColor(parsedLogs[parsedLogs.length - 1].rssi)}`} />
                      <div>
                        <div className="text-xs text-muted-foreground">信号强度</div>
                        <div className={`font-medium ${getRssiColor(parsedLogs[parsedLogs.length - 1].rssi)}`}>
                          {parsedLogs[parsedLogs.length - 1].rssi}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Historical Logs */}
              <div className="bg-muted/20 rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="text-xs text-muted-foreground mb-2">历史日志（最近 {parsedLogs.length} 条）</div>
                <div className="space-y-2">
                  {parsedLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 text-xs bg-background rounded px-3 py-2"
                    >
                      <span className="text-muted-foreground w-16">
                        {log.uptime}
                      </span>
                      <span className={`flex items-center gap-1 ${getWifiStatusColor(log.wifiStatus)}`}>
                        <Wifi className="size-3" />
                        {log.wifiStatus}
                      </span>
                      <span className="font-mono text-muted-foreground">{log.ip}</span>
                      <span className={getRssiColor(log.rssi)}>{log.rssi}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Raw Serial Output */}
          {isConnected && !isFlashing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  原始串口输出
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSerialOutput}
                  className="h-8 text-xs"
                >
                  <RefreshCw className="size-3 mr-1" />
                  清空
                </Button>
              </div>
              <div className="h-24 bg-muted/30 rounded-lg p-3 overflow-y-auto font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                {serialOutput || (
                  <span className="text-muted-foreground/50">等待数据...</span>
                )}
              </div>
            </div>
          )}

          {/* File Selection */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".bin"
              onChange={handleFileChange}
              className="hidden"
              id="firmware-file"
            />
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-12"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isConnected || isFlashing}
            >
              <Upload className="size-4" />
              {selectedFile ? `📁 ${selectedFile.name}` : '选择固件文件 (.bin)'}
            </Button>
          </div>

          {/* Flash Button */}
          <div className="mb-6">
            <Button
              className="w-full h-12 text-base"
              onClick={flashFirmware}
              disabled={!isConnected || !selectedFile || isFlashing}
            >
              {isFlashing ? '⏳ 刷写中...' : '🚀 开始刷写固件'}
            </Button>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">进度</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Message */}
          {status && (
            <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${
              status.includes('❌') 
                ? 'bg-destructive/10 text-destructive' 
                : status.includes('✅')
                ? 'bg-green-500/10 text-green-600'
                : 'bg-muted/50 text-muted-foreground'
            }`}>
              {status.includes('❌') ? (
                <AlertCircle className="size-4 flex-shrink-0" />
              ) : status.includes('✅') ? (
                <CheckCircle2 className="size-4 flex-shrink-0" />
              ) : null}
              <span>{status}</span>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium mb-3">📖 使用说明</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>1. 确保 ESP32 已进入 Bootloader 模式</li>
              <li>2. 按住 BOOT 键，然后按一下 RESET 键</li>
              <li>3. 设置波特率（默认 115200）</li>
              <li>4. 点击「连接 ESP32」选择串口设备</li>
              <li>5. 查看设备信息和实时系统状态</li>
              <li>6. 选择 .bin 格式的固件文件</li>
              <li>7. 点击「开始刷写固件」</li>
            </ul>
          </div>

          {/* Browser Support */}
          <div className="mt-4 text-xs text-muted-foreground text-center">
            <p>支持：Chrome、Edge、Opera（需要 HTTPS 或 localhost）</p>
          </div>
        </div>
      </div>
    </div>
  );
}