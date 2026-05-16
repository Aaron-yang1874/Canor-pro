import { NextRequest, NextResponse } from "next/server";
import { analyzeContext } from "@/lib/engine/context-understanding";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creativeGoal, useScenario, emotionalTendency, technicalPreference, contextDepth, historyWindow, semanticMatching } = body;

    if (!creativeGoal || !useScenario) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "creativeGoal 和 useScenario 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const result = analyzeContext({
      creativeGoal,
      useScenario,
      emotionalTendency: emotionalTendency || [],
      technicalPreference: technicalPreference || "",
      contextDepth,
      historyWindow,
      semanticMatching,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "上下文分析失败";
    const errorRecord = createErrorRecord(level, "CONTEXT_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}