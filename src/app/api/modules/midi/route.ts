import { NextRequest, NextResponse } from "next/server";
import { buildMIDIPrompt, getAvailableInstruments, getMIDIConfig, buildMultiTrackMIDIPrompt } from "@/lib/modules/midi";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";
import type { Instrument } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instrument, key, tempo, timeSignature, duration, complexity, articulation, multiTrack } = body;

    if (multiTrack && Array.isArray(multiTrack)) {
      const prompt = buildMultiTrackMIDIPrompt(multiTrack);
      return NextResponse.json({ success: true, data: { prompt } });
    }

    if (!instrument) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "instrument 为必填字段", level: "error" } },
        { status: 400 }
      );
    }

    const prompt = buildMIDIPrompt({
      instrument,
      key: key || "C",
      tempo: tempo || 120,
      timeSignature: timeSignature || "4/4",
      duration: duration || 120,
      complexity: complexity || "moderate",
      articulation: articulation || "normal",
    });

    return NextResponse.json({ success: true, data: { prompt } });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "MIDI Prompt 生成失败";
    const errorRecord = createErrorRecord(level, "MIDI_ERROR", message, String(error));
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
    const instrument = searchParams.get("instrument");

    if (instrument) {
      const config = getMIDIConfig(instrument as Instrument);
      return NextResponse.json({ success: true, data: config });
    }

    const instruments = getAvailableInstruments();
    return NextResponse.json({ success: true, data: { instruments } });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "MIDI 配置获取失败";
    const errorRecord = createErrorRecord(level, "MIDI_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}