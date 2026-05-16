import { NextRequest, NextResponse } from "next/server";
import { checkCopyright } from "@/lib/safety/content-audit";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  let audioBuffer: ArrayBuffer;
  let threshold = 0.7;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("audio") as File | null;
    if (!file) {
      return NextResponse.json({ error: "audio 文件为必填参数" }, { status: 400 });
    }
    audioBuffer = await file.arrayBuffer();
    const thresholdStr = formData.get("threshold") as string | null;
    if (thresholdStr) threshold = parseFloat(thresholdStr);
  } else {
    const body = await request.json();
    if (!body.audio) {
      return NextResponse.json({ error: "audio 为必填参数" }, { status: 400 });
    }
    const base64 = body.audio as string;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    audioBuffer = bytes.buffer;
    if (body.threshold != null) threshold = body.threshold;
  }

  const result = await checkCopyright(audioBuffer, threshold);
  return NextResponse.json(result);
}

export const POST = createApiRoute(handlePOST);
