import { NextRequest, NextResponse } from "next/server";
import {
  styleTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByEmotion,
  searchTemplates,
  getAllCategories,
  getTemplateCount,
} from "@/lib/styles/templates";
import { classifyError, createErrorRecord } from "@/lib/errors/handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const emotion = searchParams.get("emotion");
    const query = searchParams.get("query");

    if (id) {
      const template = getTemplateById(id);
      if (!template) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "模板不存在", level: "error" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: template });
    }

    if (category) {
      const templates = getTemplatesByCategory(category);
      return NextResponse.json({ success: true, data: templates });
    }

    if (emotion) {
      const templates = getTemplatesByEmotion(emotion);
      return NextResponse.json({ success: true, data: templates });
    }

    if (query) {
      const templates = searchTemplates(query);
      return NextResponse.json({ success: true, data: templates });
    }

    const categories = getAllCategories();
    const count = getTemplateCount();

    return NextResponse.json({
      success: true,
      data: {
        templates: styleTemplates,
        categories,
        count,
      },
    });
  } catch (error) {
    const level = classifyError(error);
    const message = error instanceof Error ? error.message : "模板获取失败";
    const errorRecord = createErrorRecord(level, "STYLES_ERROR", message, String(error));
    const status = level === "critical" ? 500 : level === "error" ? 400 : 200;
    return NextResponse.json(
      { success: false, error: errorRecord },
      { status }
    );
  }
}