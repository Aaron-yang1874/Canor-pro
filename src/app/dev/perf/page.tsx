"use client";

import { useEffect, useState, useRef } from "react";
import { MetricPoint, Alert, MetricDefinition } from "@/lib/devtools/perf-monitor";

interface MetricData {
  definition: MetricDefinition;
  latest: MetricPoint | null;
  history: MetricPoint[];
}

export default function PerfDashboard() {
  const [metrics, setMetrics] = useState<Record<string, MetricData>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeRange, setTimeRange] = useState<number>(3600000);
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());

  const metricNames = ["FCP", "LCP", "CLS", "generationLatency", "promptBuildTime", "apiResponseTime"];

  const fetchData = async () => {
    try {
      const metricsRes = await fetch("/api/dev/perf");
      const alertsRes = await fetch("/api/dev/perf/alerts");
      const historyRes = await fetch(`/api/dev/perf/history?range=${timeRange / 1000}s`);

      const metricsData = await metricsRes.json();
      const alertsData = await alertsRes.json();
      const historyData = await historyRes.json();

      const metricsMap: Record<string, MetricData> = {};
      metricNames.forEach((name) => {
        const def = metricsData.definitions?.find((d: any) => d.name === name);
        if (def) {
          metricsMap[name] = {
            definition: def,
            latest: metricsData.latest[name],
            history: historyData[name] || [],
          };
        }
      });

      setMetrics(metricsMap);
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  useEffect(() => {
    const canvasMap = canvasRefs.current;
    Object.entries(metrics).forEach(([name, data]) => {
      const canvas = canvasMap.get(name);
      if (!canvas || data.history.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const padding = 40;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#191414";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#282828";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding + (height - 2 * padding) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      if (data.history.length > 1) {
        const values = data.history.map((p) => p.value);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const range = maxVal - minVal || 1;

        ctx.strokeStyle = "#1DB954";
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.history.forEach((point, i) => {
          const x = padding + ((width - 2 * padding) * i) / (data.history.length - 1);
          const y = height - padding - ((point.value - minVal) / range) * (height - 2 * padding);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();

        const lastPoint = data.history[data.history.length - 1];
        const lastX = width - padding;
        const lastY = height - padding - ((lastPoint.value - minVal) / range) * (height - 2 * padding);

        ctx.fillStyle = "#1DB954";
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [metrics]);

  const formatValue = (value: number, unit: string): string => {
    if (unit === "") return value.toFixed(4);
    return `${value.toFixed(0)}${unit}`;
  };

  const getMetricColor = (name: string, value: number): string => {
    const def = metrics[name]?.definition;
    if (!def) return "text-white";
    if (value >= def.thresholds.critical) return "text-red-500";
    if (value >= def.thresholds.warning) return "text-yellow-500";
    return "text-green-500";
  };

  const getAlertColor = (level: string): string => {
    return level === "critical" ? "bg-red-900/50 border-red-500" : "bg-yellow-900/50 border-yellow-500";
  };

  const formatTimestamp = (ts: number): string => {
    return new Date(ts).toLocaleTimeString("zh-CN");
  };

  return (
    <div className="min-h-screen bg-[#191414] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1DB954]">性能监控</h1>
            <p className="text-[#B3B3B3] mt-1">实时性能指标与告警</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="bg-[#282828] text-white px-4 py-2 rounded-md border border-[#404040] focus:outline-none focus:border-[#1DB954]"
            >
              <option value={60000}>最近 1 分钟</option>
              <option value={300000}>最近 5 分钟</option>
              <option value={1800000}>最近 30 分钟</option>
              <option value={3600000}>最近 1 小时</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {metricNames.map((name) => {
            const data = metrics[name];
            if (!data) return null;

            const value = data.latest?.value ?? 0;

            return (
              <div
                key={name}
                className="bg-[#282828] rounded-lg p-4 border border-[#404040] hover:border-[#1DB954] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#B3B3B3] text-sm">{data.definition.label}</span>
                  <span className={`text-xs font-medium ${getMetricColor(name, value)}`}>
                    {name}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${getMetricColor(name, value)}`}>
                  {formatValue(value, data.definition.unit)}
                </div>
                <div className="text-xs text-[#666] mt-1">
                  阈值: {data.definition.thresholds.warning} / {data.definition.thresholds.critical}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#1DB954]">历史趋势</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {metricNames.slice(0, 4).map((name) => {
              const data = metrics[name];
              if (!data) return null;

              return (
                <div
                  key={name}
                  className="bg-[#282828] rounded-lg p-4 border border-[#404040]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{data.definition.label}</span>
                    <span className="text-xs text-[#666]">{name}</span>
                  </div>
                  <canvas
                    ref={(el) => {
                      if (el) canvasRefs.current.set(name, el);
                    }}
                    width={400}
                    height={150}
                    className="w-full h-[150px]"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#1DB954]">告警列表</h2>
          {alerts.length === 0 ? (
            <div className="bg-[#282828] rounded-lg p-8 border border-[#404040] text-center text-[#666]">
              暂无告警
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div
                  key={`${alert.metric}-${alert.timestamp}-${index}`}
                  className={`rounded-lg p-4 border ${getAlertColor(alert.level)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          alert.level === "critical" ? "bg-red-500" : "bg-yellow-500"
                        }`}
                      />
                      <span className="font-medium">
                        {metrics[alert.metric]?.definition.label || alert.metric}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        alert.level === "critical" ? "bg-red-500/30" : "bg-yellow-500/30"
                      }`}>
                        {alert.level === "critical" ? "严重" : "警告"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatValue(alert.value, metrics[alert.metric]?.definition.unit || "ms")}</div>
                      <div className="text-xs text-[#999]">{formatTimestamp(alert.timestamp)}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[#999]">
                    阈值: {formatValue(alert.threshold, metrics[alert.metric]?.definition.unit || "ms")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-[#666] text-xs">
          每秒自动刷新 | 数据保留 1 小时
        </div>
      </div>
    </div>
  );
}
