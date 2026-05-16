import { NextRequest, NextResponse } from "next/server";
import { assessQuality, quickQualityCheck } from "@/lib/engine/quality-assessment";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";
import type { QualityLevel } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, targetQuality, styleTags, emotionIntensity } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "prompt 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const result = assessQuality({
      prompt,
      targetQuality: (targetQuality || "standard") as QualityLevel,
      styleTags: styleTags || [],
      emotionIntensity: emotionIntensity || 0.5,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "质量评估失败";
    const errorRecord = createErrorRecord(level, "QUALITY_ERROR", message, String(error));
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
    const prompt = searchParams.get("prompt");

    if (prompt) {
      const result = quickQualityCheck(prompt);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({
      success: true,
      message: "使用 POST 方法进行完整质量评估，或 GET ?prompt=... 进行快速检查",
    });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "质量检查失败";
    const errorRecord = createErrorRecord(level, "QUALITY_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}