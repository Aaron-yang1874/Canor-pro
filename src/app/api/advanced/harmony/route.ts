import { NextRequest, NextResponse } from "next/server";
import { arrangeHarmony, buildHarmonyPrompt } from "@/lib/advanced/harmony-arrangement";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";
import type { ChordProgression } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chordProgression, voices, technique, density, voicingStyle, instruments } = body;

    if (!chordProgression) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "chordProgression 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const arrangement = arrangeHarmony({
      chordProgression: chordProgression as ChordProgression,
      voices,
      technique,
      density,
      voicingStyle,
      instruments,
    });

    const prompt = buildHarmonyPrompt(chordProgression, arrangement);

    return NextResponse.json({ success: true, data: { arrangement, prompt } });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "和声编排失败";
    const errorRecord = createErrorRecord(level, "HARMONY_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}