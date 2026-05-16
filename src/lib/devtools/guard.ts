import { NextRequest, NextResponse } from "next/server";
import type { NextMiddleware } from "./types";

export function isDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isDevToolsRoute(pathname: string): boolean {
  return pathname.startsWith("/dev/");
}

export function devToolsGuard(handler: NextMiddleware): NextMiddleware {
  return (request: NextRequest) => {
    if (!isDevMode()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return handler(request);
  };
}
