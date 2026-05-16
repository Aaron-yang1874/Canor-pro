import { NextRequest, NextResponse } from "next/server";
import { perfMonitor } from "@/lib/devtools/perf-monitor";

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
  const latest = perfMonitor.getLatestMetrics();
  const definitions = perfMonitor.getAllMetricDefinitions();

  return NextResponse.json({
    latest,
    definitions,
    timestamp: Date.now(),
  });
}
