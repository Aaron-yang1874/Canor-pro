import { NextRequest, NextResponse } from "next/server";
import { recognizeIntent, extractStyleTags } from "@/lib/engine/intent-recognition";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, history, creativityLevel } = body;

    if (!userInput) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "userInput 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const intent = recognizeIntent({ userInput, history, creativityLevel });
    const styleTags = extractStyleTags(userInput);

    return NextResponse.json({
      success: true,
      data: { intent, styleTags },
    });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "意图识别失败";
    const errorRecord = createErrorRecord(level, "INTENT_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}