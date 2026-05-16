import { NextRequest, NextResponse } from "next/server";
import { generateChordProgression, buildChordPrompt } from "@/lib/advanced/chord-generation";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";
import type { MusicKey, StyleTag } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, style, complexity, length, emotion } = body;

    if (!key) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "key 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const progression = generateChordProgression({
      key: key as MusicKey,
      style: style as StyleTag,
      complexity,
      length,
      emotion,
    });

    const prompt = buildChordPrompt(progression);

    return NextResponse.json({ success: true, data: { progression, prompt } });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "和弦生成失败";
    const errorRecord = createErrorRecord(level, "CHORD_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}