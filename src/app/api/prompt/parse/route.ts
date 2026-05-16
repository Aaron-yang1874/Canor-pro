import { NextRequest, NextResponse } from "next/server";
import { parsePrompt } from "@/lib/prompt/parser";
import { validatePromptString } from "@/lib/prompt/validator";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "prompt 为必填字符串字段", level: "error" } },
        { status: 400 }
      );
    }

    const parsed = parsePrompt(prompt);
    const validated = validatePromptString(prompt);

    return NextResponse.json({
      success: true,
      data: { parsed, validated },
    });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "Prompt 解析失败";
    const errorRecord = createErrorRecord(level, "PARSE_ERROR", message);
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}