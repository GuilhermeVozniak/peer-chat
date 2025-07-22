# API Reference

This document provides a comprehensive reference for all API endpoints and WebSocket message protocols used in the peer-chat application.

## Overview

The application uses a hybrid API approach:
- **HTTP REST API**: Room management and validation
- **WebSocket API**: Real-time communication and WebRTC signaling
- **Server Actions**: Next.js server actions for form submissions

## HTTP REST API

### Base URL
```
http://localhost:3000/api
```

### Authentication
No authentication required. All endpoints are publicly accessible.

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

## Room Management API

### GET /api/room

Retrieve room information and validate room existence.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roomHandle` | string | Yes | The room identifier to query |

#### Success Response (200)

```json
{
  "exists": true,
  "room": {
    "handle": "my-room",
    "participantCount": 2,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Room Not Found (404)

```json
{
  "exists": false,
  "error": "Room not found"
}
```

#### Bad Request (400)

```json
{
  "error": "Room handle is required"
}
```

#### Example Usage

```javascript
// Check if room exists
const response = await fetch('/api/room?roomHandle=my-room');
const data = await response.json();

if (data.exists) {
  console.log(`Room has ${data.room.participantCount} participants`);
} else {
  console.log('Room does not exist');
}
```

### POST /api/room

Create a new room.

#### Request Body

```json
{
  "handle": "my-room",
  "createdBy": "participant_123456789_abcdef"
}
```

#### Success Response (201)

```json
{
  "success": true,
  "room": {
    "handle": "my-room",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "createdBy": "participant_123456789_abcdef"
  }
}
```

#### Room Already Exists (409)

```json
{
  "error": "Room with handle 'my-room' already exists"
}
```

#### Validation Error (400)

```json
{
  "error": "Room handle must be between 2 and 50 characters and contain only alphanumeric characters, hyphens, and underscores"
}
```

---

## WebSocket API

### Connection Endpoint
```
ws://localhost:8080
```

### Connection Flow

1. **Establish Connection**: Client connects to WebSocket server
2. **Send Join Message**: Client sends `join-room` message
3. **Receive Room State**: Server sends current room state
4. **Handle Events**: Client processes incoming messages
5. **Send Leave Message**: Client sends `leave-room` before disconnecting

### Message Format

All WebSocket messages follow this base structure:

```typescript
interface BaseMessage {
  type: string;
  participantId: string;
  roomHandle: string;
  timestamp: number;
}
```

---

## WebSocket Message Types

### 1. join-room

**Direction**: Client → Server  
**Purpose**: Join a room as a participant

#### Message Structure

```typescript
interface JoinRoomMessage extends BaseMessage {
  type: 'join-room';
  name?: string;          // Optional display name
  isCreator?: boolean;    // True if user created the room
}
```

#### Example

```json
{
  "type": "join-room",
  "participantId": "participant_1703123456789_abc123",
  "roomHandle": "my-room",
  "timestamp": 1703123456789,
  "name": "John Doe",
  "isCreator": true
}
```

#### Server Response

The server will respond with a `room-state` message containing current participants.

### 2. leave-room

**Direction**: Client → Server  
**Purpose**: Leave the current room

#### Message Structure

```typescript
interface LeaveRoomMessage extends BaseMessage {
  type: 'leave-room';
}
```

#### Example

```json
{
  "type": "leave-room",
  "participantId": "participant_1703123456789_abc123",
  "roomHandle": "my-room",
  "timestamp": 1703123456789
}
```

#### Server Response

- If participant is room creator: `room-terminated` message to all participants
- If regular participant: `participant-left` message to remaining participants

### 3. room-state

**Direction**: Server → Client  
**Purpose**: Provide current room state and participant list

#### Message Structure

```typescript
interface RoomStateMessage extends BaseMessage {
  type: 'room-state';
  participants: Participant[];
}

interface Participant {
  id: string;
  name: string;
  roomHandle: string;
  joinedAt: Date;
}
```

#### Example

```json
{
  "type": "room-state",
  "participantId": "server",
  "roomHandle": "my-room",
  "timestamp": 1703123456789,
  "participants": [
    {
      "id": "participant_1703123456789_abc123",
      "name": "John Doe",
      "roomHandle": "my-room",
      "joinedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "participant_1703123456790_def456",
      "name": "Guest 1",
      "roomHandle": "my-room",
      "joinedAt": "2023-01-01T00:01:00.000Z"
    }
  ]
}
```

### 4. participant-joined

**Direction**: Server → Client  
**Purpose**: Notify existing participants of new joiner

#### Message Structure

```typescript
interface ParticipantJoinedMessage extends BaseMessage {
  type: 'participant-joined';
  participant: Participant;
}
```

#### Example

```json
{
  "type": "participant-joined",
  "participantId": "server",
  "roomHandle": "my-room",
  "timestamp": 1703123456789,
  "participant": {
    "id": "participant_1703123456790_def456",
    "name": "Guest 1",
    "roomHandle": "my-room",
    "joinedAt": "2023-01-01T00:01:00.000Z"
  }
}
```

### 5. participant-left

**Direction**: Server → Client  
**Purpose**: Notify remaining participants that someone left

#### Message Structure

```typescript
interface ParticipantLeftMessage extends BaseMessage {
  type: 'participant-left';
  participantId: string;  // ID of the participant who left
}
```

#### Example

```json
{
  "type": "participant-left",
  "participantId": "participant_1703123456790_def456",
  "roomHandle": "my-room",
  "timestamp": 1703123456789
}
```

### 6. room-terminated

**Direction**: Server → Client  
**Purpose**: Notify all participants that the room is being terminated

#### Message Structure

```typescript
interface RoomTerminatedMessage extends BaseMessage {
  type: 'room-terminated';
  reason: 'creator-left' | 'room-closed';
}
```

#### Example

```json
{
  "type": "room-terminated",
  "participantId": "server",
  "roomHandle": "my-room",
  "timestamp": 1703123456789,
  "reason": "creator-left"
}
```

#### Termination Reasons

- `creator-left`: Room creator left the meeting
- `room-closed`: Room was manually closed by server

---

## WebRTC Signaling Messages

### 7. webrtc-offer

**Direction**: Client → Server → Client  
**Purpose**: Send WebRTC offer for peer connection establishment

#### Message Structure

```typescript
interface WebRTCOfferMessage extends BaseMessage {
  type: 'webrtc-offer';
  targetParticipantId: string;      // Recipient of the offer
  offer: RTCSessionDescriptionInit; // WebRTC offer data
}
```

#### Example

```json
{
  "type": "webrtc-offer",
  "participantId": "participant_1703123456789_abc123",
  "roomHandle": "my-room",
  "timestamp": 1703123456789,
  "targetParticipantId": "participant_1703123456790_def456",
  "offer": {
    "type": "offer",
    "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

### 8. webrtc-answer

**Direction**: Client → Server → Client  
**Purpose**: Send WebRTC answer in response to an offer

#### Message Structure

```typescript
interface WebRTCAnswerMessage extends BaseMessage {
  type: 'webrtc-answer';
  targetParticipantId: string;       // Recipient of the answer
  answer: RTCSessionDescriptionInit; // WebRTC answer data
}
```

#### Example

```json
{
  "type": "webrtc-answer",
  "participantId": "participant_1703123456790_def456",
  "roomHandle": "my-room",
  "timestamp": 1703123456789,
  "targetParticipantId": "participant_1703123456789_abc123",
  "answer": {
    "type": "answer",
    "sdp": "v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

### 9. webrtc-ice-candidate

**Direction**: Client → Server → Client  
**Purpose**: Exchange ICE candidates for NAT traversal

#### Message Structure

```typescript
interface WebRTCIceCandidateMessage extends BaseMessage {
  type: 'webrtc-ice-candidate';
  targetParticipantId: string;    // Recipient of the candidate
  candidate: RTCIceCandidateInit; // ICE candidate data
}
```

#### Example

```json
{
  "type": "webrtc-ice-candidate",
  "participantId": "participant_1703123456789_abc123",
  "roomHandle": "my-room",
  "timestamp": 1703123456789,
  "targetParticipantId": "participant_1703123456790_def456",
  "candidate": {
    "candidate": "candidate:1 1 UDP 2113667327 192.168.1.100 54400 typ host",
    "sdpMLineIndex": 0,
    "sdpMid": "0"
  }
}
```

---

## Error Messages

### 10. error

**Direction**: Server → Client  
**Purpose**: Notify client of errors

#### Message Structure

```typescript
interface ErrorMessage extends BaseMessage {
  type: 'error';
  error: string;
  code?: string;
}
```

#### Example

```json
{
  "type": "error",
  "participantId": "server",
  "roomHandle": "my-room",
  "timestamp": 1703123456789,
  "error": "Room not found",
  "code": "ROOM_NOT_FOUND"
}
```

#### Common Error Codes

- `ROOM_NOT_FOUND`: Specified room does not exist
- `INVALID_PARTICIPANT`: Participant ID is invalid or missing
- `WEBSOCKET_ERROR`: General WebSocket communication error
- `SIGNALING_ERROR`: WebRTC signaling-related error

---

## Server Actions API

Next.js server actions for form submissions and navigation.

### createRoomAction

Create a new room and redirect to it.

#### Function Signature

```typescript
async function createRoomAction(
  roomHandle: string,
  name?: string
): Promise<void>
```

#### Parameters

- `roomHandle`: Room identifier (2-50 characters, alphanumeric + hyphens/underscores)
- `name`: Optional user display name (max 30 characters)

#### Behavior

1. Validates room handle format
2. Creates room via Room Service
3. Stores user name in sessionStorage (client-side)
4. Sets creator flag in sessionStorage
5. Redirects to `/room/[roomHandle]`

#### Usage

```tsx
import { createRoomAction } from '@/app/actions/room';

const handleSubmit = async (data: { roomHandle: string; name?: string }) => {
  await createRoomAction(data.roomHandle, data.name);
};
```

### joinRoomAction

Join an existing room.

#### Function Signature

```typescript
async function joinRoomAction(
  roomHandle: string,
  name?: string
): Promise<void>
```

#### Parameters

- `roomHandle`: Room identifier to join
- `name`: Optional user display name (max 30 characters)

#### Behavior

1. Stores user name in sessionStorage (client-side)
2. Clears creator flag in sessionStorage
3. Redirects to `/room/[roomHandle]`
4. Room existence is validated client-side after redirect

#### Usage

```tsx
import { joinRoomAction } from '@/app/actions/room';

const handleSubmit = async (data: { roomHandle: string; name?: string }) => {
  await joinRoomAction(data.roomHandle, data.name);
};
```

---

## WebSocket Client Integration

### Connection Management

```typescript
class WebSocketClient {
  private ws: WebSocket | null = null;
  private participantId: string;
  private roomHandle: string;

  connect(roomHandle: string, participantId: string, name?: string) {
    this.ws = new WebSocket('ws://localhost:8080');
    this.participantId = participantId;
    this.roomHandle = roomHandle;

    this.ws.onopen = () => {
      this.joinRoom(name);
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private joinRoom(name?: string) {
    const isCreator = sessionStorage.getItem('isRoomCreator') === 'true';
    
    this.send({
      type: 'join-room',
      participantId: this.participantId,
      roomHandle: this.roomHandle,
      timestamp: Date.now(),
      name,
      isCreator,
    });
  }

  private send(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  leaveRoom() {
    this.send({
      type: 'leave-room',
      participantId: this.participantId,
      roomHandle: this.roomHandle,
      timestamp: Date.now(),
    });
  }

  sendWebRTCOffer(targetParticipantId: string, offer: RTCSessionDescriptionInit) {
    this.send({
      type: 'webrtc-offer',
      participantId: this.participantId,
      roomHandle: this.roomHandle,
      timestamp: Date.now(),
      targetParticipantId,
      offer,
    });
  }

  sendWebRTCAnswer(targetParticipantId: string, answer: RTCSessionDescriptionInit) {
    this.send({
      type: 'webrtc-answer',
      participantId: this.participantId,
      roomHandle: this.roomHandle,
      timestamp: Date.now(),
      targetParticipantId,
      answer,
    });
  }

  sendWebRTCIceCandidate(targetParticipantId: string, candidate: RTCIceCandidateInit) {
    this.send({
      type: 'webrtc-ice-candidate',
      participantId: this.participantId,
      roomHandle: this.roomHandle,
      timestamp: Date.now(),
      targetParticipantId,
      candidate,
    });
  }
}
```

### Message Handling

```typescript
private handleMessage(message: WebSocketMessage) {
  switch (message.type) {
    case 'room-state':
      this.updateParticipants(message.participants);
      break;

    case 'participant-joined':
      this.addParticipant(message.participant);
      this.initiateWebRTCConnection(message.participant.id);
      break;

    case 'participant-left':
      this.removeParticipant(message.participantId);
      this.closeWebRTCConnection(message.participantId);
      break;

    case 'room-terminated':
      this.handleRoomTermination(message.reason);
      break;

    case 'webrtc-offer':
      this.handleWebRTCOffer(message.participantId, message.offer);
      break;

    case 'webrtc-answer':
      this.handleWebRTCAnswer(message.participantId, message.answer);
      break;

    case 'webrtc-ice-candidate':
      this.handleWebRTCIceCandidate(message.participantId, message.candidate);
      break;

    case 'error':
      console.error('Server error:', message.error);
      break;

    default:
      console.warn('Unknown message type:', message.type);
  }
}
```

---

## Rate Limiting & Security

### Request Limits

Currently, there are no rate limits implemented. In production, consider:

- **WebSocket Connections**: Max 100 connections per IP per minute
- **Room Creation**: Max 10 rooms per IP per hour
- **Message Rate**: Max 50 messages per connection per minute

### Security Headers

The application includes basic security headers:

```typescript
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
};
```

### Input Validation

All inputs are validated on both client and server:

- **Room Handles**: 2-50 characters, alphanumeric + hyphens/underscores
- **User Names**: Max 30 characters, sanitized
- **Participant IDs**: Generated server-side, validated format

---

## Error Handling Best Practices

### Client-Side Error Handling

```typescript
// WebSocket connection errors
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  showErrorToast('Connection failed. Please refresh the page.');
};

// WebSocket message errors
ws.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);
    handleMessage(message);
  } catch (error) {
    console.error('Failed to parse message:', error);
    showErrorToast('Received invalid message format.');
  }
};

// API request errors
const checkRoom = async (roomHandle: string) => {
  try {
    const response = await fetch(`/api/room?roomHandle=${roomHandle}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        showErrorToast(`Room "${roomHandle}" does not exist`);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Room check failed:', error);
    showErrorToast('Failed to verify room. Please try again.');
    return null;
  }
};
```

### Server-Side Error Handling

```typescript
// WebSocket message validation
function validateMessage(message: any): message is WebSocketMessage {
  if (!message.type || !message.participantId || !message.roomHandle) {
    return false;
  }
  
  if (typeof message.timestamp !== 'number') {
    return false;
  }
  
  return true;
}

// Room operation error handling
try {
  await roomService.createRoom(roomHandle);
} catch (error) {
  if (error instanceof RoomAlreadyExistsError) {
    return NextResponse.json(
      { error: 'Room already exists' },
      { status: 409 }
    );
  }
  
  console.error('Room creation failed:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Testing API Endpoints

### HTTP API Testing

```bash
# Test room existence (existing room)
curl "http://localhost:3000/api/room?roomHandle=test-room"

# Test room existence (non-existent room)
curl "http://localhost:3000/api/room?roomHandle=non-existent"

# Create new room
curl -X POST "http://localhost:3000/api/room" \
  -H "Content-Type: application/json" \
  -d '{"handle": "test-room", "createdBy": "participant_123"}'
```

### WebSocket Testing

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8080');

// Join room
ws.send(JSON.stringify({
  type: 'join-room',
  participantId: 'participant_123456789_test',
  roomHandle: 'test-room',
  timestamp: Date.now(),
  name: 'Test User',
  isCreator: true
}));

// Leave room
ws.send(JSON.stringify({
  type: 'leave-room',
  participantId: 'participant_123456789_test',
  roomHandle: 'test-room',
  timestamp: Date.now()
}));
```

### Automated Testing

```typescript
// Jest test example
describe('Room API', () => {
  test('should return 404 for non-existent room', async () => {
    const response = await fetch('/api/room?roomHandle=non-existent');
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data.exists).toBe(false);
  });

  test('should create new room successfully', async () => {
    const response = await fetch('/api/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: 'test-room',
        createdBy: 'participant_123'
      })
    });
    
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.room.handle).toBe('test-room');
  });
});
```

This API reference provides complete documentation for integrating with the peer-chat application's backend services. All endpoints and message types are production-ready and include comprehensive error handling. 