import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  
  if (!roomId) {
    return NextResponse.json(
      { error: 'Room ID is required' },
      { status: 400 }
    );
  }
  
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  
  return NextResponse.json({
    socketUrl,
    roomId,
    connectionParams: {
      roomId,
      transports: ['websocket', 'polling']
    },
    serverEndpoint: '/api/collaboration/socket',
    message: 'WebSocket server should run on a separate process using the collaboration server'
  });
}
