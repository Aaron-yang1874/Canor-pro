import { NextRequest, NextResponse } from "next/server";
import { zeroShotGeneration } from "@/lib/evolution/zero-shot";
import { createApiRoute } from "@/lib/middleware/api-middleware";

const VALID_MODALITIES = ["text", "image", "audio", "video"] as const;

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { prompt, modality, numIterations, styleNeighbors, qualityThreshold, interpolationWeights } = body;
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt 为必填参数" }, { status: 400 });
  }
  const resolvedModality = VALID_MODALITIES.includes(modality) ? modality : "text";
  const result = zeroShotGeneration({
    prompt,
    modality: resolvedModality,
    numIterations: typeof numIterations === "number" && numIterations > 0 ? numIterations : 3,
    styleNeighbors: typeof styleNeighbors === "number" && styleNeighbors > 0 ? styleNeighbors : 5,
    qualityThreshold: typeof qualityThreshold === "number" && qualityThreshold >= 0 && qualityThreshold <= 1 ? qualityThreshold : 0.7,
    interpolationWeights: Array.isArray(interpolationWeights) ? interpolationWeights : [0.5, 0.3, 0.2],
  });
  return NextResponse.json(result);
}

export const POST = createApiRoute(handlePOST, { rateLimit: 30 });
