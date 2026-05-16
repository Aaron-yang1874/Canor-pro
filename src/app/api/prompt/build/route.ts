import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildPrompt, buildQuickPrompt } from "@/lib/prompt/builder";
import { createApiRoute } from "@/lib/middleware/api-middleware";
import { auditContent } from "@/lib/safety/content-audit";
import type { BuiltPromptV4, ModalityType, MultimodalInput, EvolutionConfig, StyleTag, GenerationOutput, QualityScores, CopyrightToken, StemTrack, QualityLevel, AudioSpec, GenerationMetrics } from "@/lib/types";

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();

  const {
    moduleId,
    systemParams,
    styleTags,
    functionModules,
    qualityParams,
    creativeInstruction,
    modality,
    multimodalInput,
    evolution,
  } = body;

  if (!creativeInstruction) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "creativeInstruction 为必填字段", level: "error" } },
      { status: 400 }
    );
  }

  const basePrompt = buildPrompt({
    moduleId,
    systemParams,
    styleTags,
    functionModules,
    qualityParams,
    creativeInstruction,
  });

  const safetyAudit = await auditContent(creativeInstruction);

  const v4Prompt: BuiltPromptV4 = {
    ...basePrompt,
    modality: (modality as ModalityType) || "text",
    multimodalInput: multimodalInput as MultimodalInput | undefined,
    evolution: evolution as EvolutionConfig | undefined,
    safetyAudit,
  };

  const qualityLevel: QualityLevel = qualityParams?.quality || "standard";
  const duration = systemParams?.duration || 180;
  const hasVocals = systemParams?.hasVocals !== undefined ? systemParams.hasVocals : true;

  const sampleRateMap: Record<QualityLevel, 44100 | 48000 | 96000> = {
    draft: 44100,
    standard: 44100,
    high: 48000,
    master: 96000,
  };

  const bitDepthMap: Record<QualityLevel, 16 | 24 | 32> = {
    draft: 16,
    standard: 16,
    high: 24,
    master: 32,
  };

  const audioSpec: AudioSpec = {
    sampleRate: sampleRateMap[qualityLevel],
    bitDepth: bitDepthMap[qualityLevel],
    channels: qualityLevel === "master" ? "7.1.4" : qualityLevel === "high" ? "5.1" : "stereo",
    frequencyResponse: { low: 20, high: qualityLevel === "master" ? 40000 : 20000 },
    dynamicRange: qualityLevel === "master" ? 96 : qualityLevel === "high" ? 72 : 48,
    signalToNoiseRatio: qualityLevel === "master" ? 120 : qualityLevel === "high" ? 96 : 60,
  };

  const stemTypes: StemTrack["type"][] = hasVocals
    ? ["vocals", "drums", "bass", "melody"]
    : ["drums", "bass", "melody", "effects"];

  const stems: StemTrack[] = stemTypes.map((type) => ({
    type,
    audioUrl: `https://api.canor.ai/stems/${type}-${Date.now()}.wav`,
    duration,
    format: "wav" as const,
    sampleRate: audioSpec.sampleRate,
  }));

  const randomScore = (min: number, max: number) =>
    Math.round((Math.random() * (max - min) + min) * 100) / 100;

  const qualityScores: QualityScores = {
    coherence: randomScore(0.6, 0.95),
    creativity: randomScore(0.5, 0.98),
    technicalQuality: randomScore(0.6, 0.95),
    emotionalImpact: randomScore(0.5, 0.95),
    structuralIntegrity: randomScore(0.6, 0.95),
    harmony: randomScore(0.6, 0.95),
    rhythm: randomScore(0.6, 0.95),
    timbre: randomScore(0.5, 0.95),
    dynamics: randomScore(0.5, 0.95),
    spatialQuality: randomScore(0.5, 0.95),
    originality: randomScore(0.5, 0.98),
    productionQuality: randomScore(0.6, 0.95),
    overall: 0,
  };
  qualityScores.overall = Math.round(
    (Object.entries(qualityScores).filter(([k]) => k !== "overall").reduce((s, [, v]) => s + v, 0) / 12) * 100
  ) / 100;

  const copyrightToken: CopyrightToken = {
    tokenId: `tk-${Date.now()}-${randomBytes(4).toString("hex")}`,
    blockchainHash: `0x${randomBytes(32).toString("hex")}`,
    timestamp: new Date().toISOString(),
    licenseType: "original",
    owner: "user",
    verified: false,
  };

  const generationMetrics: GenerationMetrics = {
    durationSeconds: duration,
    generationTimeMs: 0,
    iterationsUsed: 0,
    qualityScore: qualityScores.overall,
    creativityScore: systemParams?.creativity_level || 0.75,
    modelVersion: "4.0.0",
  };

  const generationOutput: GenerationOutput = {
    audioUrl: `https://api.canor.ai/audio/${Date.now()}.wav`,
    waveformData: [],
    stems,
    qualityScores,
    copyrightToken,
    metadata: generationMetrics,
    audioSpec,
  };

  return NextResponse.json({ success: true, data: { ...v4Prompt, output: generationOutput } });
}

async function handleGET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style") as string | null;
  const emotion = searchParams.get("emotion") || "愉快";
  const description = searchParams.get("description") || "";

  if (style) {
    const basePrompt = buildQuickPrompt(style as StyleTag, emotion, description);
    const safetyAudit = await auditContent(basePrompt.components.creativeInstruction);
    const v4Prompt: BuiltPromptV4 = {
      ...basePrompt,
      modality: "text",
      safetyAudit,
    };
    return NextResponse.json({ success: true, data: v4Prompt });
  }

  return NextResponse.json({
    success: true,
    message: "使用 POST 方法构建完整 Prompt，或使用 GET ?style=pop&emotion=愉快&description=描述 快速构建",
  });
}

const POST = createApiRoute(handlePOST, { auditContent: true });
const GET = createApiRoute(handleGET, { auditContent: true });

export { POST, GET };