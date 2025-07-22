import { RoomManager } from '@/lib/room-manager';
import type { ExtendedWebSocket, WebSocketMessage } from '@/types/websocket';
import { type NextRequest, NextResponse } from 'next/server';
import { WebSocketServer } from 'ws';

// Create singleton WebSocket server and room manager
let wss: WebSocketServer | null = null;
let roomManager: RoomManager | null = null;

function getWebSocketServer(): WebSocketServer {
  if (!wss) {
    wss = new WebSocketServer({ port: 8080 });
    roomManager = new RoomManager();

    // Setup WebSocket server event handlers
    wss.on('connection', (ws: ExtendedWebSocket) => {
      console.log('New WebSocket connection established');

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(
            data.toString(),
          ) as WebSocketMessage;
          handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          sendError(ws, 'Invalid message format');
        }
      });

      // Handle WebSocket errors
      ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
      });

      // Handle WebSocket close
      ws.on('close', () => {
        console.log('WebSocket connection closed');
        roomManager?.handleDisconnection(ws);
      });

      // Handle ping/pong for connection health
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Initial setup
      ws.isAlive = true;
    });

    // Cleanup interval for dead connections
    setInterval(() => {
      roomManager?.cleanup();
    }, 30000);

    console.log('WebSocket server started on port 8080');
  }

  return wss;
}

// Handle different types of WebSocket messages
function handleMessage(ws: ExtendedWebSocket, message: WebSocketMessage): void {
  console.log(
    'Received message:',
    message.type,
    'from participant:',
    message.participantId,
  );

  switch (message.type) {
    case 'join-room':
      handleJoinRoom(ws, message);
      break;

    case 'leave-room':
      handleLeaveRoom(ws, message);
      break;

    case 'webrtc-offer':
    case 'webrtc-answer':
    case 'webrtc-ice-candidate':
      handleWebRTCSignaling(ws, message);
      break;

    default:
      console.warn('Unknown message type:', message.type);
      sendError(ws, 'Unknown message type');
  }
}

// Handle room joining
function handleJoinRoom(
  ws: ExtendedWebSocket,
  message: WebSocketMessage,
): void {
  if (message.type !== 'join-room') return;

  const { participantId, roomHandle, name } = message;

  if (!participantId || !roomHandle) {
    sendError(ws, 'Missing participantId or roomHandle');
    return;
  }

  roomManager?.joinRoom(ws, roomHandle, participantId, name);
}

// Handle room leaving
function handleLeaveRoom(
  ws: ExtendedWebSocket,
  message: WebSocketMessage,
): void {
  if (message.type !== 'leave-room') return;

  const { participantId } = message;

  if (!participantId) {
    sendError(ws, 'Missing participantId');
    return;
  }

  roomManager?.leaveRoom(participantId);
}

// Handle WebRTC signaling messages
function handleWebRTCSignaling(
  ws: ExtendedWebSocket,
  message: WebSocketMessage,
): void {
  if (!ws.participantId) {
    sendError(ws, 'Must join room before WebRTC signaling');
    return;
  }

  // Validate signaling message
  if (
    message.type === 'webrtc-offer' ||
    message.type === 'webrtc-answer' ||
    message.type === 'webrtc-ice-candidate'
  ) {
    if (!message.targetParticipantId) {
      sendError(ws, 'Missing targetParticipantId in signaling message');
      return;
    }

    // Forward the signaling message
    roomManager?.forwardSignalingMessage(ws.participantId, message);
  }
}

// Send error message to client
function sendError(
  ws: ExtendedWebSocket,
  error: string,
  details?: string,
): void {
  const message = {
    type: 'error',
    participantId: ws.participantId ?? 'unknown',
    roomHandle: ws.roomHandle ?? 'unknown',
    timestamp: Date.now(),
    error,
    details,
  };

  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Initialize WebSocket server when this route is first accessed
export function GET(_request: NextRequest) {
  try {
    // Start the WebSocket server
    getWebSocketServer();

    return NextResponse.json({
      status: 'WebSocket server running on port 8080',
      message: 'Connect to ws://localhost:8080',
    });
  } catch (error) {
    console.error('Error starting WebSocket server:', error);
    return NextResponse.json(
      { error: 'Failed to start WebSocket server' },
      { status: 500 },
    );
  }
}
