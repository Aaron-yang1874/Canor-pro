import { NextRequest, NextResponse } from "next/server";
import { inspector } from "@/lib/devtools/inspector";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Development only" }, { status: 403 });
  }

  try {
    const records = inspector.getRecords();
    const breakpoints = inspector.getBreakpoints();
    const isPaused = inspector.isPaused();
    const pausedStepId = inspector.getPausedStepId();

    return NextResponse.json({
      records,
      breakpoints,
      isPaused,
      pausedStepId,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Development only" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, stepId } = body;

    switch (action) {
      case "setBreakpoint":
        if (stepId) {
          inspector.setBreakpoint(stepId);
          return NextResponse.json({ success: true, action: "setBreakpoint", stepId });
        }
        return NextResponse.json({ error: "stepId required" }, { status: 400 });

      case "clearBreakpoint":
        if (stepId) {
          inspector.clearBreakpoint(stepId);
          return NextResponse.json({ success: true, action: "clearBreakpoint", stepId });
        }
        return NextResponse.json({ error: "stepId required" }, { status: 400 });

      case "pauseAt":
        if (stepId) {
          inspector.pauseAt(stepId);
          return NextResponse.json({ success: true, action: "pauseAt", stepId });
        }
        return NextResponse.json({ error: "stepId required" }, { status: 400 });

      case "resume":
        inspector.resume();
        return NextResponse.json({ success: true, action: "resume" });

      case "clearRecords":
        inspector.clearRecords();
        return NextResponse.json({ success: true, action: "clearRecords" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
