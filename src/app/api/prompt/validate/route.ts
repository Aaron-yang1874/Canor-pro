import { NextRequest, NextResponse } from "next/server";
import { validateComponents } from "@/lib/prompt/validator";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { components } = body;

    if (!components) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "components 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const result = validateComponents(components);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "验证失败";
    const errorRecord = createErrorRecord(level, "VALIDATE_ERROR", message);
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}