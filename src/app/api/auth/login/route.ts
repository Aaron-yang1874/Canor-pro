import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth/jwt";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { userId, password } = body;

  if (!userId || !password) {
    return NextResponse.json({ error: "userId 和 password 为必填参数" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "密码长度至少 6 位" }, { status: 400 });
  }

  const token = await signToken({ userId, role: "user" });

  return NextResponse.json({
    success: true,
    token,
    expiresIn: "24h",
  });
}

export const POST = createApiRoute(handlePOST, { requireAuth: false, rateLimit: 10 });
