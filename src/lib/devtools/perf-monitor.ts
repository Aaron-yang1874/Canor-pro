export interface MetricPoint {
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

export interface Alert {
  level: "warning" | "critical";
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
}

export interface MetricDefinition {
  name: string;
  label: string;
  unit: string;
  thresholds: {
    warning: number;
    critical: number;
  };
}

class PerfMonitorState {
  static BUFFER_SIZE = 3600;

  private metrics: Map<string, MetricPoint[]> = new Map();
  private metricDefinitions: Map<string, MetricDefinition> = new Map();

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    const definitions: MetricDefinition[] = [
      { name: "FCP", label: "First Contentful Paint", unit: "ms", thresholds: { warning: 1800, critical: 3000 } },
      { name: "LCP", label: "Largest Contentful Paint", unit: "ms", thresholds: { warning: 2500, critical: 4000 } },
      { name: "CLS", label: "Cumulative Layout Shift", unit: "", thresholds: { warning: 0.1, critical: 0.25 } },
      { name: "generationLatency", label: "生成延迟", unit: "ms", thresholds: { warning: 8000, critical: 10000 } },
      { name: "promptBuildTime", label: "Prompt 构建耗时", unit: "ms", thresholds: { warning: 500, critical: 1000 } },
      { name: "apiResponseTime", label: "API 响应时间", unit: "ms", thresholds: { warning: 2000, critical: 3000 } },
    ];

    definitions.forEach(def => {
      this.metricDefinitions.set(def.name, def);
      this.metrics.set(def.name, []);
    });
  }

  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const buffer = this.metrics.get(name)!;
    const point: MetricPoint = {
      timestamp: Date.now(),
      value,
      labels,
    };

    buffer.push(point);

    if (buffer.length > PerfMonitorState.BUFFER_SIZE) {
      buffer.shift();
    }
  }

  getMetrics(name: string, timeRange?: number): MetricPoint[] {
    const buffer = this.metrics.get(name);
    if (!buffer) return [];

    if (!timeRange) return [...buffer];

    const now = Date.now();
    const cutoff = now - timeRange;
    return buffer.filter(p => p.timestamp >= cutoff);
  }

  getLatestMetrics(): Record<string, MetricPoint | null> {
    const result: Record<string, MetricPoint | null> = {};

    this.metrics.forEach((buffer, name) => {
      result[name] = buffer.length > 0 ? buffer[buffer.length - 1] : null;
    });

    return result;
  }

  getAlerts(): Alert[] {
    const alerts: Alert[] = [];
    const now = Date.now();

    this.metrics.forEach((buffer, metricName) => {
      if (buffer.length === 0) return;

      const definition = this.metricDefinitions.get(metricName);
      if (!definition) return;

      const latest = buffer[buffer.length - 1];
      const { thresholds } = definition;

      if (metricName === "apiResponseTime" && latest.value > 3000) {
        alerts.push({
          level: latest.value > 5000 ? "critical" : "warning",
          metric: metricName,
          value: latest.value,
          threshold: 3000,
          timestamp: latest.timestamp,
        });
      }

      if (metricName === "generationLatency" && latest.value > 10000) {
        alerts.push({
          level: "critical",
          metric: metricName,
          value: latest.value,
          threshold: 10000,
          timestamp: latest.timestamp,
        });
      }

      if (latest.value >= thresholds.critical) {
        alerts.push({
          level: "critical",
          metric: metricName,
          value: latest.value,
          threshold: thresholds.critical,
          timestamp: latest.timestamp,
        });
      } else if (latest.value >= thresholds.warning) {
        alerts.push({
          level: "warning",
          metric: metricName,
          value: latest.value,
          threshold: thresholds.warning,
          timestamp: latest.timestamp,
        });
      }
    });

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  getMetricDefinition(name: string): MetricDefinition | undefined {
    return this.metricDefinitions.get(name);
  }

  getAllMetricDefinitions(): MetricDefinition[] {
    return Array.from(this.metricDefinitions.values());
  }
}

export const perfMonitor = new PerfMonitorState();

if (typeof window !== "undefined") {
  (window as any).__perfMonitor = perfMonitor;
}
