export interface PresenceState {
  userId: string;
  userName: string;
  cursor: {
    line: number;
    column: number;
  };
  color: string;
}

export interface PresenceManager {
  localUser: PresenceState | null;
  remoteUsers: Map<string, PresenceState>;
  setLocalCursor(line: number, column: number): void;
  broadcastCursor(): void;
  onRemoteCursorUpdate(callback: (userId: string, state: PresenceState) => void): void;
  onUserJoin(callback: (state: PresenceState) => void): void;
  onUserLeave(callback: (userId: string) => void): void;
}

export function createPresenceManager(userId: string, userName: string, color: string): PresenceManager {
  const manager: PresenceManager = {
    localUser: {
      userId,
      userName,
      cursor: { line: 0, column: 0 },
      color
    },
    remoteUsers: new Map(),
    
    setLocalCursor(line: number, column: number): void {
      if (this.localUser) {
        this.localUser.cursor = { line, column };
      }
    },
    
    broadcastCursor(): void {
    },
    
    onRemoteCursorUpdate(callback: (userId: string, state: PresenceState) => void): void {
    },
    
    onUserJoin(callback: (state: PresenceState) => void): void {
    },
    
    onUserLeave(callback: (userId: string) => void): void {
    }
  };
  
  return manager;
}
