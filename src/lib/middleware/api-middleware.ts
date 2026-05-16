import { NextRequest, NextResponse } from "next/server";
import { createErrorRecord, classifyError } from "@/lib/errors/handler";
import { auditContent } from "@/lib/safety/content-audit";
import { verifyToken } from "@/lib/auth/jwt";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_RATE_LIMIT_ENTRIES = 10000;
const RATE_LIMIT_CLEANUP_THRESHOLD = 8000;

function checkRateLimit(ip: string, limit: number): boolean {
  const now = Date.now();
  if (rateLimitMap.size > RATE_LIMIT_CLEANUP_THRESHOLD) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }
  if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
    const oldestKey = rateLimitMap.keys().next().value;
    if (oldestKey) rateLimitMap.delete(oldestKey);
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

async function verifyAuthToken(request: NextRequest): Promise<{ valid: boolean; userId?: string; role?: string }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false };
  }
  const token = authHeader.slice(7);
  return verifyToken(token);
}

export interface ApiHandlerOptions {
  auditContent?: boolean;
  requireAuth?: boolean;
  rateLimit?: number;
}

const isDev = process.env.NODE_ENV === "development";

export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (err) {
      const level = classifyError(err);
      const message = err instanceof Error ? err.message : "Internal Server Error";
      const errorRecord = createErrorRecord(level, "API_ERROR", message, isDev ? String(err) : undefined);
      const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
      return NextResponse.json(
        {
          success: false,
          error: {
            id: errorRecord.id,
            code: errorRecord.code,
            message: "请求处理失败",
            ...(isDev && { details: errorRecord.details }),
          },
        },
        { status }
      );
    }
  };
}

export function withAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const { valid, userId, role } = await verifyAuthToken(request);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "未授权访问" } },
        { status: 401 }
      );
    }
    (request as NextRequest & { userId?: string; userRole?: string }).userId = userId;
    (request as NextRequest & { userRole?: string }).userRole = role;
    return handler(request);
  };
}

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  limit: number = 100
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    if (!checkRateLimit(ip, limit)) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "请求过于频繁" } },
        { status: 429 }
      );
    }
    return handler(request);
  };
}

export function withContentAudit(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      const body = await request.clone().json();
      if (body.content || body.prompt || body.creativeInstruction) {
        const contentToAudit = body.content || body.prompt || body.creativeInstruction || "";
        const auditResult = auditContent(contentToAudit);
        if (!auditResult.passed) {
          return NextResponse.json(
            { success: false, audit: auditResult, message: "Content failed safety audit" },
            { status: 400 }
          );
        }
      }
    } catch {
      // body parsing failed, skip audit
    }
    return handler(request);
  };
}

export function createApiRoute(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  let wrapped = handler;
  if (options.auditContent) {
    wrapped = withContentAudit(wrapped);
  }
  if (options.requireAuth !== false) {
    wrapped = withAuth(wrapped);
  }
  wrapped = withRateLimit(wrapped, options.rateLimit || 100);
  wrapped = withErrorHandler(wrapped);
  return wrapped;
}
