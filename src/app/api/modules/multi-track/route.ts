import { NextRequest, NextResponse } from "next/server";
import { buildMultiTrackPrompt, createDefaultMultiTrackConfig, getTrackTemplate } from "@/lib/modules/multi-track-export";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tracks, exportFormat, bitDepth, sampleRate, normalizeStems, includeRawMix } = body;

    if (!tracks || !Array.isArray(tracks)) {
      return NextResponse.json(
        { error: "tracks 为必填数组字段" },
        { status: 400 }
      );
    }

    const prompt = buildMultiTrackPrompt({
      tracks,
      exportFormat: exportFormat || "wav",
      bitDepth: bitDepth || 24,
      sampleRate: sampleRate || 48000,
      normalizeStems: normalizeStems ?? true,
      includeRawMix: includeRawMix ?? true,
    });

    return NextResponse.json({ prompt });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "处理失败，请稍后重试" } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style");

  if (style) {
    const template = getTrackTemplate(style);
    return NextResponse.json(template);
  }

  const defaultConfig = createDefaultMultiTrackConfig();
  return NextResponse.json(defaultConfig);
}