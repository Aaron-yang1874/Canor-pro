import { NextRequest, NextResponse } from "next/server";
import {
  startServer,
  stopServer,
  getDevServerState,
} from "@/lib/devtools/plugin-devserver";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "DevServer is only available in development mode" },
      { status: 403 }
    );
  }

  const state = getDevServerState();
  return NextResponse.json(state);
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "DevServer is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { action, pluginsDir } = body;

    if (action === "start") {
      if (!pluginsDir) {
        return NextResponse.json(
          { error: "pluginsDir is required to start DevServer" },
          { status: 400 }
        );
      }
      await startServer(pluginsDir);
      return NextResponse.json({
        success: true,
        message: "DevServer started",
        state: getDevServerState(),
      });
    } else if (action === "stop") {
      stopServer();
      return NextResponse.json({
        success: true,
        message: "DevServer stopped",
        state: getDevServerState(),
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'start' or 'stop'" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
