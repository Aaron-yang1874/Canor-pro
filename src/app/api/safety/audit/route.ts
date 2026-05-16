import { NextRequest, NextResponse } from "next/server";
import { auditContent } from "@/lib/safety/content-audit";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { content, type } = body;
  if (!content) {
    return NextResponse.json({ error: "content 为必填参数" }, { status: 400 });
  }
  const result = auditContent(content);
  return NextResponse.json(result);
}

export const POST = createApiRoute(handlePOST, { auditContent: true });
