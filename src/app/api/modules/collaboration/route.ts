import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  getSession,
  addParticipant,
  addTrack,
  updateTrackStatus,
  addMessage,
  buildCollaborationPrompt,
  getAllSessions,
  deleteSession,
} from "@/lib/modules/collaboration";
import { createApiRoute } from "@/lib/middleware/api-middleware";

async function handlePOST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;
  const currentUserId = (request as NextRequest & { userId?: string }).userId;

  switch (action) {
    case "create": {
      const { projectName } = body;
      if (!projectName) {
        return NextResponse.json({ error: "projectName 为必填参数" }, { status: 400 });
      }
      const session = createSession(projectName, currentUserId || "anonymous");
      return NextResponse.json(session);
    }
    case "join": {
      const { sessionId, userId } = body;
      if (!sessionId) {
        return NextResponse.json({ error: "sessionId 为必填参数" }, { status: 400 });
      }
      const session = addParticipant(sessionId, userId || currentUserId || "anonymous");
      if (!session) {
        return NextResponse.json({ error: "会话不存在" }, { status: 404 });
      }
      return NextResponse.json(session);
    }
    case "addTrack": {
      const { sessionId, track } = body;
      if (!sessionId || !track) {
        return NextResponse.json({ error: "sessionId 和 track 为必填参数" }, { status: 400 });
      }
      const session = addTrack(sessionId, track);
      if (!session) {
        return NextResponse.json({ error: "会话不存在" }, { status: 404 });
      }
      return NextResponse.json(session);
    }
    case "updateTrackStatus": {
      const { sessionId, trackId, status } = body;
      if (!sessionId || !trackId || !status) {
        return NextResponse.json({ error: "sessionId, trackId, status 为必填参数" }, { status: 400 });
      }
      const session = updateTrackStatus(sessionId, trackId, status);
      if (!session) {
        return NextResponse.json({ error: "会话或轨道不存在" }, { status: 404 });
      }
      return NextResponse.json(session);
    }
    case "addMessage": {
      const { sessionId, content } = body;
      if (!sessionId || !content) {
        return NextResponse.json({ error: "sessionId 和 content 为必填参数" }, { status: 400 });
      }
      const session = addMessage(sessionId, {
        sender: currentUserId || "anonymous",
        content,
        type: "comment",
      });
      if (!session) {
        return NextResponse.json({ error: "会话不存在" }, { status: 404 });
      }
      return NextResponse.json(session);
    }
    case "buildPrompt": {
      const { sessionId } = body;
      if (!sessionId) {
        return NextResponse.json({ error: "sessionId 为必填参数" }, { status: 400 });
      }
      const prompt = buildCollaborationPrompt(sessionId);
      if (!prompt) {
        return NextResponse.json({ error: "会话不存在" }, { status: 404 });
      }
      return NextResponse.json({ prompt });
    }
    default:
      return NextResponse.json({ error: `未知操作: ${action}` }, { status: 400 });
  }
}

async function handleGET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  if (sessionId) {
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }
    return NextResponse.json(session);
  }
  return NextResponse.json(getAllSessions());
}

async function handleDELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId 为必填参数" }, { status: 400 });
  }
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }
  const currentUserId = (request as NextRequest & { userId?: string }).userId;
  if (session.participants[0] !== currentUserId) {
    return NextResponse.json({ error: "仅创建者可删除会话" }, { status: 403 });
  }
  const deleted = deleteSession(sessionId);
  return NextResponse.json({ success: deleted });
}

export const POST = createApiRoute(handlePOST);
export const GET = createApiRoute(handleGET);
export const DELETE = createApiRoute(handleDELETE);
