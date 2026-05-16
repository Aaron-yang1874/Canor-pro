import { NextRequest, NextResponse } from "next/server";
import { transpose, buildTranspositionPrompt, checkInstrumentRange, suggestBestKey } from "@/lib/advanced/transposition";
import type { MusicKey, Instrument } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceKey, targetKey, preserveOctave, instrumentConstraints } = body;

    if (!sourceKey || !targetKey) {
      return NextResponse.json(
        { error: "sourceKey 和 targetKey 为必填字段" },
        { status: 400 }
      );
    }

    const result = transpose({
      sourceKey: sourceKey as MusicKey,
      targetKey: targetKey as MusicKey,
      preserveOctave: preserveOctave ?? true,
      instrumentConstraints: instrumentConstraints || [],
    });

    const prompt = buildTranspositionPrompt(result, preserveOctave ?? true);

    return NextResponse.json({ result, prompt });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "处理失败，请稍后重试" } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const instruments = searchParams.getAll("instrument");

  if (instruments.length > 0) {
    const bestKey = suggestBestKey(instruments as Instrument[]);
    const checks = instruments.map((inst) => ({
      instrument: inst,
      ...checkInstrumentRange(inst as Instrument, (key || "C") as MusicKey),
    }));

    return NextResponse.json({ bestKey, checks });
  }

  if (key) {
    const check = checkInstrumentRange("piano", key as MusicKey);
    return NextResponse.json(check);
  }

  return NextResponse.json({
    message: "使用 POST 进行转调处理，或 GET ?instruments=piano,guitar 获取最佳调性建议",
  });
}