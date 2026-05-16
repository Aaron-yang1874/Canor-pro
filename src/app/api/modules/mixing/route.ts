import { NextRequest, NextResponse } from "next/server";
import { listMixingPresets, getMixingPreset, buildMixingPrompt, getPresetsByStyle } from "@/lib/modules/mixing-mastering";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const presetId = searchParams.get("id");
    const style = searchParams.get("style");
    const build = searchParams.get("build");

    if (build === "true" && presetId) {
      const preset = getMixingPreset(presetId);
      if (!preset) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "预设不存在", level: "error" } },
          { status: 404 }
        );
      }
      const prompt = buildMixingPrompt(preset);
      return NextResponse.json({ success: true, data: { preset, prompt } });
    }

    if (presetId) {
      const preset = getMixingPreset(presetId);
      if (!preset) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "预设不存在", level: "error" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: preset });
    }

    if (style) {
      const presets = getPresetsByStyle(style);
      return NextResponse.json({ success: true, data: presets });
    }

    const presets = listMixingPresets();
    return NextResponse.json({ success: true, data: presets });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "混音预设获取失败";
    const errorRecord = createErrorRecord(level, "MIXING_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}