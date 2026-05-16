import { Server as SocketIOServer, Socket } from 'socket.io';
import { createCRDTDoc, CRDTDoc } from './crdt-doc';
import { createPresenceManager, PresenceManager } from './presence';

interface CollaborationRoom {
  roomId: string;
  crdtDoc: CRDTDoc;
  presenceManager: PresenceManager;
  clients: Set<Socket>;
}

class CollaborationServer {
  private rooms: Map<string, CollaborationRoom> = new Map();
  private io: SocketIOServer | null = null;
  private port: number = 3001;
  
  initialize(port?: number): SocketIOServer {
    if (!this.io) {
      this.port = port || 3001;
      this.io = new SocketIOServer(this.port, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      });
      
      this.io.on('connection', (socket: Socket) => {
        const roomId = socket.handshake.query.roomId as string;
        const userId = socket.handshake.query.userId as string;
        const userName = socket.handshake.query.userName as string;
        
        if (roomId && userId && userName) {
          this.join(socket, roomId, userId, userName);
        }
        
        socket.on('cursor-update', (data: { line: number; column: number }) => {
          const room = this.getRoom(socket);
          if (room) {
            room.presenceManager.setLocalCursor(data.line, data.column);
            this.broadcastPresence(room, socket.id);
          }
        });
        
        socket.on('crdt-update', (data: { fieldName: string; update: string }) => {
          const room = this.getRoom(socket);
          if (room) {
            const updateArray = new Uint8Array(JSON.parse(data.update));
            room.crdtDoc.updateText(data.fieldName, updateArray);
            this.broadcastUpdate(room, data, socket.id);
          }
        });
        
        socket.on('disconnect', () => {
          const room = this.getRoom(socket);
          if (room) {
            this.leave(socket);
          }
        });
      });
    }
    return this.io;
  }
  
  private getRoom(socket: Socket): CollaborationRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.clients.has(socket)) {
        return room;
      }
    }
    return undefined;
  }
  
  join(client: Socket, roomId: string, userId: string, userName: string): void {
    let room = this.rooms.get(roomId);
    
    if (!room) {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
      const color = colors[this.rooms.size % colors.length];
      
      const crdtDoc = createCRDTDoc();
      const presenceManager = createPresenceManager(userId, userName, color);
      
      room = {
        roomId,
        crdtDoc,
        presenceManager,
        clients: new Set()
      };
      
      this.rooms.set(roomId, room);
    }
    
    room.clients.add(client);
    client.join(roomId);
    
    client.emit('room-joined', {
      roomId,
      state: room.crdtDoc.doc.getMap('shared').toJSON(),
      users: Array.from(room.presenceManager.remoteUsers.values())
    });
    
    this.broadcastPresence(room, client.id);
  }
  
  leave(client: Socket): void {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.clients.has(client)) {
        room.clients.delete(client);
        client.leave(roomId);
        
        room.presenceManager.remoteUsers.delete(client.id);
        
        client.to(roomId).emit('user-left', { userId: client.id });
        
        if (room.clients.size === 0) {
          this.rooms.delete(roomId);
        } else {
          this.broadcastPresence(room);
        }
        
        break;
      }
    }
  }
  
  broadcastUpdate(room: CollaborationRoom, data: { fieldName: string; update: string }, excludeSocketId?: string): void {
    const updateMessage = {
      fieldName: data.fieldName,
      update: data.update,
      userId: excludeSocketId
    };
    
    room.clients.forEach((client) => {
      if (client.id !== excludeSocketId) {
        client.emit('crdt-update', updateMessage);
      }
    });
  }
  
  broadcastPresence(room: CollaborationRoom, excludeSocketId?: string): void {
    const presenceData = {
      userId: room.presenceManager.localUser?.userId,
      userName: room.presenceManager.localUser?.userName,
      cursor: room.presenceManager.localUser?.cursor,
      color: room.presenceManager.localUser?.color
    };
    
    room.clients.forEach((client) => {
      if (client.id !== excludeSocketId) {
        client.emit('presence-update', presenceData);
      }
    });
  }
  
  getRoomInfo(roomId: string): CollaborationRoom | undefined {
    return this.rooms.get(roomId);
  }
  
  getActiveRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}

export const collaborationServer = new CollaborationServer();
