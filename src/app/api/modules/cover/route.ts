import { NextRequest, NextResponse } from "next/server";
import { buildCoverPrompt, getCoverStyleRecommendations } from "@/lib/modules/ai-cover";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";
import type { StyleTag } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceTrack, targetStyle, vocalModel, preserveMelody, preserveLyrics, keyShift, tempoShift } = body;

    if (!sourceTrack || !targetStyle) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "sourceTrack 和 targetStyle 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const prompt = buildCoverPrompt({
      sourceTrack,
      targetStyle,
      vocalModel,
      preserveMelody,
      preserveLyrics,
      keyShift,
      tempoShift,
    });

    return NextResponse.json({ success: true, data: { prompt } });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "翻唱 Prompt 生成失败";
    const errorRecord = createErrorRecord(level, "COVER_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceStyle = searchParams.get("sourceStyle");

    if (sourceStyle) {
      const recommendations = getCoverStyleRecommendations(sourceStyle as StyleTag);
      return NextResponse.json({ success: true, data: recommendations });
    }

    return NextResponse.json({
      success: true,
      message: "使用 POST 生成翻唱 Prompt，或 GET ?sourceStyle=pop 获取风格推荐",
    });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "翻唱推荐获取失败";
    const errorRecord = createErrorRecord(level, "COVER_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}