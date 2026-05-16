import { NextRequest, NextResponse } from "next/server";
import { listSoundEffects, getSoundEffect, buildSoundEffectPrompt, listByCategory } from "@/lib/modules/sound-effects";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { effectName, config } = body;

    if (!effectName) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "effectName 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const prompt = buildSoundEffectPrompt(effectName, config);
    return NextResponse.json({ success: true, data: { prompt } });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "音效 Prompt 生成失败";
    const errorRecord = createErrorRecord(level, "SOUNDFX_ERROR", message, String(error));
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
    const name = searchParams.get("name");
    const category = searchParams.get("category");

    if (name) {
      const effect = getSoundEffect(name);
      if (!effect) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "音效不存在", level: "error" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: effect });
    }

    if (category) {
      const effects = listByCategory(category as never);
      return NextResponse.json({ success: true, data: effects });
    }

    const effects = listSoundEffects();
    return NextResponse.json({ success: true, data: effects });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "音效获取失败";
    const errorRecord = createErrorRecord(level, "SOUNDFX_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}