import { NextRequest, NextResponse } from "next/server";
import { perfMonitor, type MetricPoint } from "@/lib/devtools/perf-monitor";

const METRIC_NAMES = ["FCP", "LCP", "CLS", "generationLatency", "promptBuildTime", "apiResponseTime"];

function parseTimeRange(range: string | undefined): number | undefined {
  if (!range) return undefined;

  const match = range.match(/^(\d+)(s|m|h)$/);
  if (!match) return undefined;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      return undefined;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const range = searchParams.get("range");
  const timeRange = parseTimeRange(range ?? undefined);

  if (!name) {
    const allHistory: Record<string, MetricPoint[]> = {};
    METRIC_NAMES.forEach((metricName) => {
      allHistory[metricName] = perfMonitor.getMetrics(metricName, timeRange);
    });
    return NextResponse.json(allHistory);
  }

  const metrics = perfMonitor.getMetrics(name, timeRange);
  return NextResponse.json(metrics);
}
