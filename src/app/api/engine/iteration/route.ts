import { NextRequest, NextResponse } from "next/server";
import { performIteration, batchIterate } from "@/lib/engine/iterative-optimization";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalPrompt, feedback, currentIteration, maxIterations, feedbackList } = body;

    if (feedbackList && Array.isArray(feedbackList)) {
      const result = batchIterate(
        originalPrompt || "",
        feedbackList,
        maxIterations || 5
      );
      return NextResponse.json(result);
    }

    if (!originalPrompt || !feedback) {
      return NextResponse.json(
        { error: "originalPrompt 和 feedback 为必填字段" },
        { status: 400 }
      );
    }

    const result = performIteration({
      originalPrompt,
      feedback,
      currentIteration: currentIteration || 0,
      maxIterations,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "处理失败，请稍后重试" } },
      { status: 500 }
    );
  }
}