import { NextRequest, NextResponse } from "next/server";
import { deleteUserData } from "@/lib/safety/privacy";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const targetUserId = body.userId;
  if (!targetUserId) {
    return NextResponse.json({ error: "userId 为必填参数" }, { status: 400 });
  }
  const currentUserId = (request as NextRequest & { userId?: string }).userId;
  if (targetUserId !== currentUserId) {
    return NextResponse.json({ error: "无权删除他人数据" }, { status: 403 });
  }
  const { success, deletedRecords } = deleteUserData(targetUserId);
  return NextResponse.json({ success, deletedRecords });
}

export const POST = createApiRoute(handlePOST);
