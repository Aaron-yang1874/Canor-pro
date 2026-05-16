import { NextRequest, NextResponse } from "next/server";
import { computeReward, createReplayBuffer, processInteraction } from "@/lib/evolution/online-learning";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { interaction, preferenceVector } = body;
  if (!interaction) {
    return NextResponse.json({ error: "interaction 为必填参数" }, { status: 400 });
  }
  const reward = computeReward(interaction);
  const buffer = createReplayBuffer();
  const record = { ...interaction, reward, timestamp: new Date().toISOString() };
  const result = processInteraction(buffer, record, preferenceVector || [0.5, 0.5, 0.5, 0.5]);
  return NextResponse.json({ reward, result });
}

export const POST = createApiRoute(handlePOST);
