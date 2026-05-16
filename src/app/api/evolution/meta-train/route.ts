import { NextRequest, NextResponse } from "next/server";
import { initializeMetaLearningState, updateMetaLearningState } from "@/lib/evolution/meta-learning";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { config, loss } = body;
  let state = initializeMetaLearningState();
  if (config && loss !== undefined) {
    state = updateMetaLearningState(state, config, loss);
  }
  return NextResponse.json(state);
}

export const POST = createApiRoute(handlePOST, { rateLimit: 30 });
