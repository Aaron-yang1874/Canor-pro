import { NextRequest, NextResponse } from "next/server";
import { analyzeSong, buildAnalysisPrompt } from "@/lib/advanced/song-analysis";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, styleHints, duration } = body;

    if (!description) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "description 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const analysis = analyzeSong({ description, styleHints, duration });
    const prompt = buildAnalysisPrompt(analysis);

    return NextResponse.json({ success: true, data: { analysis, prompt } });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "歌曲分析失败";
    const errorRecord = createErrorRecord(level, "ANALYSIS_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}