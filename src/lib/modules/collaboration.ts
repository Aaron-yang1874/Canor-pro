import type { CollaborationSession, CollaborationTrack, CollaborationMessage } from "@/lib/types";
import { checkPermission, Role } from "@/lib/rbac";
import { Permission } from "@/lib/rbac";

const sessions = new Map<string, CollaborationSession>();

export function createSession(
  projectName: string,
  creatorId: string
): CollaborationSession {
  const id = `session_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const session: CollaborationSession = {
    id,
    participants: [creatorId],
    projectName,
    tracks: [],
    chatHistory: [],
    createdAt: now,
    updatedAt: now,
  };

  sessions.set(id, session);
  return session;
}

export function getSession(id: string): CollaborationSession | null {
  return sessions.get(id) || null;
}

export function addParticipant(sessionId: string, userId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  if (session.participants.includes(userId)) return true;

  session.participants.push(userId);
  session.updatedAt = new Date().toISOString();
  return true;
}

export function addTrack(
  sessionId: string,
  track: Omit<CollaborationTrack, "id" | "status" | "version">
): CollaborationTrack | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const newTrack: CollaborationTrack = {
    id: `track_${Date.now()}`,
    ...track,
    status: "draft",
    version: 1,
  };

  session.tracks.push(newTrack);
  session.updatedAt = new Date().toISOString();
  return newTrack;
}

export function updateTrackStatus(
  sessionId: string,
  trackId: string,
  status: CollaborationTrack["status"]
): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;

  const track = session.tracks.find((t) => t.id === trackId);
  if (!track) return false;

  track.status = status;
  if (status === "locked") {
    track.version += 1;
  }
  session.updatedAt = new Date().toISOString();
  return true;
}

export function addMessage(
  sessionId: string,
  message: Omit<CollaborationMessage, "id" | "timestamp">
): CollaborationMessage | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const newMessage: CollaborationMessage = {
    id: `msg_${Date.now()}`,
    ...message,
    timestamp: new Date().toISOString(),
  };

  session.chatHistory.push(newMessage);
  session.updatedAt = new Date().toISOString();
  return newMessage;
}

export function getTracksByStatus(
  sessionId: string,
  status: CollaborationTrack["status"]
): CollaborationTrack[] {
  const session = sessions.get(sessionId);
  if (!session) return [];
  return session.tracks.filter((t) => t.status === status);
}

export function buildCollaborationPrompt(sessionId: string): string | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const lines: string[] = [
    "【协作创作】",
    "$collaboration",
    `%quality=high`,
    "",
    `项目: ${session.projectName}`,
    `参与者: ${session.participants.join(", ")}`,
    "",
    "分轨状态:",
  ];

  for (const track of session.tracks) {
    const statusLabel = {
      draft: "草稿",
      review: "审核中",
      approved: "已通过",
      locked: "已锁定",
    }[track.status];

    lines.push(
      `  [${statusLabel}] ${track.name} - ${track.owner} (${track.instrument}) v${track.version}`
    );
  }

  lines.push("");
  lines.push("协作要求:");
  lines.push("1. 确保各分轨之间的调性和节奏一致");
  lines.push("2. 注意频率分配，避免各声部之间的频率冲突");
  lines.push("3. 保持整体风格的统一性");

  return lines.join("\n");
}

export function getAllSessions(): CollaborationSession[] {
  return Array.from(sessions.values());
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

export function inviteCollaborator(
  sessionId: string,
  inviterRole: Role,
  newParticipantId: string
): boolean {
  if (!checkPermission(inviterRole, Permission.ManageMembers)) {
    throw new Error("权限不足：无法邀请协作者");
  }
  return addParticipant(sessionId, newParticipantId);
}

export function removeCollaborator(
  sessionId: string,
  removerRole: Role,
  participantId: string
): boolean {
  if (!checkPermission(removerRole, Permission.ManageMembers)) {
    throw new Error("权限不足：无法移除协作者");
  }
  const session = sessions.get(sessionId);
  if (!session) return false;
  const index = session.participants.indexOf(participantId);
  if (index === -1) return false;
  session.participants.splice(index, 1);
  session.updatedAt = new Date().toISOString();
  return true;
}

export function updatePermission(
  sessionId: string,
  updaterRole: Role,
  _targetUserId: string,
  _newRole: Role
): boolean {
  if (!checkPermission(updaterRole, Permission.ManageMembers)) {
    throw new Error("权限不足：无法更新权限");
  }
  const session = sessions.get(sessionId);
  if (!session) return false;
  session.updatedAt = new Date().toISOString();
  return true;
}