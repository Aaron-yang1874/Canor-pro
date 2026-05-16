import { NextRequest, NextResponse } from "next/server";
import { globalAggregation, incrementalUpdate } from "@/lib/federated/cloud";
import { createApiRoute } from "@/lib/middleware/api-middleware";

const DEFAULT_GLOBAL_MODEL = {
  modelVersion: "1.0",
  globalWeights: [0.1, 0.2, 0.3, 0.4, 0.5],
  aggregationRound: 0,
  participatingClients: 1,
  convergenceMetric: 0.5,
  lastUpdated: new Date().toISOString(),
};

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { regionalStates, config, currentGlobalModel } = body;
  if (!Array.isArray(regionalStates) || regionalStates.length === 0) {
    return NextResponse.json({ error: "regionalStates 数组为必填参数" }, { status: 400 });
  }
  const fedConfig = config || {
    layers: [{ name: "model", version: "1.0" }],
    aggregationStrategy: "fedavg",
    minClientsPerRound: 1,
    localEpochs: 1,
    batchSize: 32,
    privacyBudget: 1.0,
  };
  const globalModel = currentGlobalModel || DEFAULT_GLOBAL_MODEL;
  const result = globalAggregation(regionalStates, fedConfig, globalModel);
  return NextResponse.json(result);
}

async function handleGET() {
  const updatedWeights = incrementalUpdate(DEFAULT_GLOBAL_MODEL.globalWeights, [0.01, 0.01, 0.01, 0.01, 0.01]);
  return NextResponse.json({
    modelVersion: DEFAULT_GLOBAL_MODEL.modelVersion,
    globalWeights: updatedWeights,
    aggregationRound: DEFAULT_GLOBAL_MODEL.aggregationRound,
  });
}

export const POST = createApiRoute(handlePOST, { rateLimit: 30 });
export const GET = createApiRoute(handleGET, { rateLimit: 30 });
