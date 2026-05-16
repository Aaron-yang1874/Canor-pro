import { NextRequest, NextResponse } from "next/server";
import { checkCopyright } from "@/lib/safety/content-audit";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { content, referenceHashes } = body;
  if (!content) {
    return NextResponse.json({ error: "content 为必填参数" }, { status: 400 });
  }
  const result = checkCopyright(content, referenceHashes || []);
  return NextResponse.json(result);
}

export const POST = createApiRoute(handlePOST);
