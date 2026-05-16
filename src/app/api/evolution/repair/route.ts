import { NextRequest, NextResponse } from "next/server";
import { selfCognitionAndRepair } from "@/lib/evolution/self-repair";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { prompt, maxIterations } = body;
  if (!prompt) {
    return NextResponse.json({ error: "prompt 为必填参数" }, { status: 400 });
  }
  const result = selfCognitionAndRepair(prompt, maxIterations || 3);
  return NextResponse.json(result);
}

export const POST = createApiRoute(handlePOST);
