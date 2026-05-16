import { NextRequest, NextResponse } from "next/server";
import { perfMonitor } from "@/lib/devtools/perf-monitor";

export async function GET(request: NextRequest) {
  const alerts = perfMonitor.getAlerts();
  return NextResponse.json({ alerts });
}
