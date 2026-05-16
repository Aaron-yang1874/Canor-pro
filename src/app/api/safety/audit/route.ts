import { NextRequest, NextResponse } from "next/server";
import { auditContent, preAudit, nlpAudit } from "@/lib/safety/content-audit";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { content, type } = body;
  if (!content) {
    return NextResponse.json({ error: "content 为必填参数" }, { status: 400 });
  }

  const preResult = preAudit(content);
  const nlpResult = await nlpAudit(content);
  const fullResult = await auditContent(content);

  return NextResponse.json({
    preAudit: preResult,
    nlpAudit: nlpResult,
    result: fullResult,
  });
}

export const POST = createApiRoute(handlePOST, { auditContent: true });
