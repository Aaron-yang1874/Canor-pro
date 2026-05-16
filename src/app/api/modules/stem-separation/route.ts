import { NextRequest, NextResponse } from "next/server";
import {
  buildStemSeparationPrompt,
  createDefaultStemConfig,
  createExtendedStemConfig,
  getStemPreset,
  getAvailableStems,
} from "@/lib/modules/stem-separation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceTrack, stems, algorithm, quality, outputFormat, normalizeOutput, preset } = body;

    if (preset) {
      const presetConfig = getStemPreset(preset);
      if (!presetConfig) {
        return NextResponse.json(
          { error: `未知预设: ${preset}，支持: basic, extended, vocals_only, instrumental` },
          { status: 400 }
        );
      }
      const presetPrompt = buildStemSeparationPrompt({
        ...presetConfig,
        sourceTrack: sourceTrack || "",
      });
      return NextResponse.json({ config: presetConfig, prompt: presetPrompt });
    }

    if (!sourceTrack) {
      return NextResponse.json(
        { error: "sourceTrack 为必填字段" },
        { status: 400 }
      );
    }

    const config = {
      sourceTrack,
      stems: stems || createDefaultStemConfig().stems,
      algorithm: algorithm || "demucs",
      quality: quality || "balanced",
      outputFormat: outputFormat || "wav",
      normalizeOutput: normalizeOutput ?? true,
    };

    const prompt = buildStemSeparationPrompt(config);

    return NextResponse.json({ config, prompt });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "处理失败，请稍后重试" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  const stems = getAvailableStems();
  const presets = ["basic", "extended", "vocals_only", "instrumental"];

  return NextResponse.json({ stems, presets });
}