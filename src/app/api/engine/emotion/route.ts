import { NextRequest, NextResponse } from "next/server";
import { analyzeEmotion, getEmotionProfile, getRecommendedStyles, getRecommendedKey, getRecommendedTempo } from "@/lib/engine/emotion-analysis";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";
import type { EmotionTag } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, targetEmotion, styleTags } = body;

    if (!description) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "description 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const profile = analyzeEmotion({ description, targetEmotion, styleTags });
    const recommendedStyles = getRecommendedStyles(profile.primary);
    const recommendedKey = getRecommendedKey(profile.primary);
    const recommendedTempo = getRecommendedTempo(profile.primary);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        recommendations: {
          styles: recommendedStyles,
          key: recommendedKey,
          tempo: recommendedTempo,
        },
      },
    });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "情感分析失败";
    const errorRecord = createErrorRecord(level, "EMOTION_ERROR", message, String(error));
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
    const emotion = searchParams.get("emotion");

    if (emotion) {
      const profile = getEmotionProfile(emotion as EmotionTag);
      return NextResponse.json({ success: true, data: profile });
    }

    return NextResponse.json({
      success: true,
      message: "使用 POST 方法分析情感，或使用 GET ?emotion=happy 获取情感配置",
    });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "情感配置获取失败";
    const errorRecord = createErrorRecord(level, "EMOTION_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}