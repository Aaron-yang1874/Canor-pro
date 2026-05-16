import { NextRequest, NextResponse } from "next/server";
import { isDevMode, isDevToolsRoute } from "@/lib/devtools";

const PUBLIC_API_PREFIXES = ["/api/auth/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isDevToolsRoute(pathname) && !isDevMode()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  for (const prefix of PUBLIC_API_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("X-Request-ID", crypto.randomUUID());
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
