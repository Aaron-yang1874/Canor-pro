import { NextRequest, NextResponse } from "next/server";
import { getSmartRecommendations, buildRecommendationPrompt, getTrendingStyles, getPopularCombinations } from "@/lib/advanced/smart-recommendation";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { styleTags, emotion, genre, instruments, tempo, previousCreations } = body;

    const recommendation = getSmartRecommendations({
      styleTags,
      emotion,
      genre,
      instruments,
      tempo,
      previousCreations,
    });

    const prompt = buildRecommendationPrompt(recommendation);

    return NextResponse.json({ success: true, data: { recommendation, prompt } });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "智能推荐失败";
    const errorRecord = createErrorRecord(level, "RECOMMEND_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}

export async function GET() {
  try {
    const trending = getTrendingStyles();
    const popular = getPopularCombinations();

    return NextResponse.json({ success: true, data: { trending, popular } });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "推荐数据获取失败";
    const errorRecord = createErrorRecord(level, "RECOMMEND_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}