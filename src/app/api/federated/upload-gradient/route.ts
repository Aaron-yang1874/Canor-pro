import { NextRequest, NextResponse } from "next/server";
import { createGradientUpdate } from "@/lib/federated/client";
import { createApiRoute } from "@/lib/middleware/api-middleware";

const MAX_GRADIENT_NORM = 10.0;
const MAX_WEIGHTS_LENGTH = 100000;

function validateGradient(weights: number[]): { valid: boolean; reason?: string } {
  if (!Array.isArray(weights)) {
    return { valid: false, reason: "weights 必须为数字数组" };
  }
  if (weights.length === 0 || weights.length > MAX_WEIGHTS_LENGTH) {
    return { valid: false, reason: `weights 长度须在 1-${MAX_WEIGHTS_LENGTH} 之间` };
  }
  for (const w of weights) {
    if (typeof w !== "number" || !isFinite(w)) {
      return { valid: false, reason: "weights 包含非有限数值" };
    }
  }
  const norm = Math.sqrt(weights.reduce((sum, w) => sum + w * w, 0));
  if (norm > MAX_GRADIENT_NORM) {
    return { valid: false, reason: `梯度范数 ${norm.toFixed(2)} 超过阈值 ${MAX_GRADIENT_NORM}` };
  }
  return { valid: true };
}

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { clientId, weights, deviceId, epsilon } = body;
  if (!clientId || !weights) {
    return NextResponse.json({ error: "clientId 和 weights 为必填参数" }, { status: 400 });
  }
  const validation = validateGradient(weights);
  if (!validation.valid) {
    return NextResponse.json({ error: "梯度验证失败", reason: validation.reason }, { status: 400 });
  }
  const result = createGradientUpdate(clientId, weights, deviceId, epsilon);
  return NextResponse.json(result);
}

export const POST = createApiRoute(handlePOST, { rateLimit: 30 });
