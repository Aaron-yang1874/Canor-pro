import { NextRequest, NextResponse } from "next/server";
import { fuseMultimodal } from "@/lib/multimodal/fusion";
import { createApiRoute } from "@/lib/middleware/api-middleware";

const MAX_BODY_SIZE = 10 * 1024 * 1024;
const VALID_MODALITIES = ["text", "image", "audio", "video"] as const;

async function handlePOST(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "请求体超过 10MB 限制" }, { status: 413 });
  }
  const body = await request.json();
  const { modalities, textPrompt, imageData, audioData, videoData, fusionStrategy, modalityWeights } = body;
  if (!modalities || !Array.isArray(modalities) || modalities.length === 0) {
    return NextResponse.json({ error: "modalities 数组为必填参数" }, { status: 400 });
  }
  const validMods = modalities.filter((m: string) => VALID_MODALITIES.includes(m as typeof VALID_MODALITIES[number]));
  if (validMods.length === 0) {
    return NextResponse.json({ error: `modalities 须包含 ${VALID_MODALITIES.join("/")}` }, { status: 400 });
  }
  const result = fuseMultimodal({
    modalities: validMods,
    textPrompt,
    imageData,
    audioData,
    videoData,
    fusionStrategy: fusionStrategy || "weighted",
    modalityWeights: modalityWeights || { text: 0.25, image: 0.25, audio: 0.25, video: 0.25 },
  });
  return NextResponse.json(result);
}

export const POST = createApiRoute(handlePOST, { rateLimit: 30 });
