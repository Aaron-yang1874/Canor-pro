import { NextRequest, NextResponse } from "next/server";
import { regionalSync } from "@/lib/federated/aggregator";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { region, gradients } = body;
  if (!region) {
    return NextResponse.json({ error: "region 为必填参数" }, { status: 400 });
  }
  const result = regionalSync(region, gradients || []);
  return NextResponse.json(result);
}

async function handleGET() {
  return NextResponse.json({ status: "active", regions: [] });
}

export const POST = createApiRoute(handlePOST, { rateLimit: 30 });
export const GET = createApiRoute(handleGET, { rateLimit: 30 });
