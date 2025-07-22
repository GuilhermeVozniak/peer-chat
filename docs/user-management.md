# User Management & Room Features

This document covers the comprehensive user management and room functionality implemented in the peer-chat application.

## Overview

The application provides a complete user and room management system that handles participant names, guest assignment, room creation/joining, and room lifecycle management. The system ensures a smooth experience for both named users and anonymous guests.

## Features

### 👤 User Management
- **Custom Names**: Users can enter their own display name
- **Guest Assignment**: Automatic sequential guest names for unnamed users
- **Persistent Identity**: Names preserved across page refreshes during sessions
- **Creator Identification**: Room creators are tracked and have special privileges

### 🏠 Room Management
- **Room Creation**: Dynamic room creation with custom handles
- **Room Joining**: Join existing rooms with validation
- **Room Validation**: Server-side validation of room existence
- **Room Termination**: Automatic cleanup when creator leaves

### 👥 Participant Management
- **Real-time Updates**: Live participant list updates
- **Join/Leave Events**: Broadcast participant changes to all users
- **Creator Privileges**: Room creators control room lifecycle
- **Guest Numbering**: Sequential guest naming (Guest 1, Guest 2, etc.)

## Architecture

### Data Flow

```
Client -> Server Action -> Room Service -> Room Repository -> In-Memory Storage
                      ↓
WebSocket Connection -> Room Manager -> Participant Management -> Broadcast Updates
```

### Key Components

```
app/
├── actions/
│   └── room.ts                    # Server actions for room operations
├── api/
│   ├── room/
│   │   ├── route.ts              # Room HTTP API endpoints
│   │   ├── service/              # Business logic layer
│   │   ├── repository/           # Data access layer
│   │   └── dto/                  # Data transfer objects
│   └── socket/
│       └── route.ts              # WebSocket handling
├── page.tsx                      # Home page with room creation/joining
└── room/[roomHandle]/
    └── page.tsx                  # Meeting room interface
```

## User Name System

### Name Input & Validation

Located at `app/page.tsx`

```typescript
const roomFormSchema = z.object({
  roomHandle: z.string().min(2).max(50).regex(/^[a-zA-Z0-9-_]+$/),
  name: z
    .string()
    .max(30, 'Name must be less than 30 characters')
    .optional()
    .or(z.literal('')),
});
```

**Features:**
- Optional name field (up to 30 characters)
- Validation with Zod schema
- Graceful handling of empty names
- Client-side storage via `sessionStorage`

### Guest Name Generation

Located at `lib/room-manager.ts`

```typescript
private generateGuestName(roomHandle: string): string {
  const room = this.rooms.get(roomHandle);
  if (!room) return 'Guest 1';

  const existingGuests = Array.from(room.participants.values())
    .map(p => p.name)
    .filter(name => name.startsWith('Guest '))
    .map(name => {
      const match = name.match(/^Guest (\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .sort((a, b) => a - b);

  let nextNumber = 1;
  for (const num of existingGuests) {
    if (num === nextNumber) {
      nextNumber++;
    } else {
      break;
    }
  }

  return `Guest ${nextNumber}`;
}
```

**Algorithm:**
1. Extract existing guest numbers from room participants
2. Sort numbers to find gaps
3. Assign lowest available number
4. Ensures sequential numbering (Guest 1, Guest 2, Guest 3...)

### Session Storage Management

```typescript
// Store user name on room creation/join
if (data.name?.trim()) {
  sessionStorage.setItem('userName', data.name.trim());
} else {
  sessionStorage.removeItem('userName');
}

// Store creator flag
sessionStorage.setItem('isRoomCreator', 'true'); // for creators
sessionStorage.removeItem('isRoomCreator');      // for joiners
```

## Room Lifecycle Management

### Room Creation Flow

1. **Client Request**: User submits room handle and optional name
2. **Server Action**: `createRoomAction` processes the request
3. **Room Service**: Creates room entry in repository
4. **Client Redirect**: User redirected to meeting room
5. **WebSocket Join**: Client connects and sends join-room message
6. **Creator Assignment**: First participant marked as room creator

### Room Joining Flow

1. **Room Validation**: Check if room exists via HTTP API
2. **Client Redirect**: User redirected to meeting room
3. **WebSocket Join**: Client connects and sends join-room message
4. **Participant Addition**: Added to room participant list
5. **Broadcast Update**: All participants notified of new joiner

### Room Termination

#### Creator Leave Termination

```typescript
leaveRoom(participantId: string): void {
  const participantData = this.participants.get(participantId);
  if (!participantData) return;

  const { roomHandle } = participantData;
  const room = this.rooms.get(roomHandle);
  if (!room) return;

  const isCreator = room.createdBy === participantId;

  if (isCreator) {
    // Terminate entire room when creator leaves
    this.terminateRoom(roomHandle, 'creator-left');
  } else {
    // Normal participant leave
    this.broadcastToRoom(roomHandle, {
      type: 'participant-left',
      participantId,
      roomHandle,
      timestamp: Date.now(),
    });
  }

  // Cleanup
  this.participants.delete(participantId);
  room.participants.delete(participantId);

  if (room.participants.size === 0) {
    this.rooms.delete(roomHandle);
  }
}
```

#### Room Termination Message

```typescript
private terminateRoom(
  roomHandle: string,
  reason: 'creator-left' | 'room-closed',
): void {
  const room = this.rooms.get(roomHandle);
  if (!room) return;

  // Broadcast termination to all participants
  this.broadcastToRoom(roomHandle, {
    type: 'room-terminated',
    roomHandle,
    timestamp: Date.now(),
    reason,
  });

  // Clean up all participants
  for (const participantId of room.participants.keys()) {
    this.participants.delete(participantId);
  }

  // Delete the room
  this.rooms.delete(roomHandle);
}
```

## WebSocket Message Protocol

### Message Types

```typescript
export type WebSocketMessage =
  | JoinRoomMessage
  | LeaveRoomMessage
  | ParticipantJoinedMessage
  | ParticipantLeftMessage
  | RoomStateMessage
  | RoomTerminatedMessage
  | WebRTCOfferMessage
  | WebRTCAnswerMessage
  | WebRTCIceCandidateMessage
  | ErrorMessage;
```

### Key Messages

#### Join Room Message

```typescript
export interface JoinRoomMessage extends BaseMessage {
  type: 'join-room';
  name?: string;          // Optional user name
  isCreator?: boolean;    // Creator flag from sessionStorage
}
```

#### Room State Message

```typescript
export interface RoomStateMessage extends BaseMessage {
  type: 'room-state';
  participants: Participant[];  // Current room participants
}
```

#### Participant Management Messages

```typescript
export interface ParticipantJoinedMessage extends BaseMessage {
  type: 'participant-joined';
  participant: Participant;
}

export interface ParticipantLeftMessage extends BaseMessage {
  type: 'participant-left';
  participantId: string;
}
```

#### Room Termination Message

```typescript
export interface RoomTerminatedMessage extends BaseMessage {
  type: 'room-terminated';
  reason: 'creator-left' | 'room-closed';
}
```

## Participant Data Structure

### Participant Interface

```typescript
export interface Participant {
  id: string;           // Unique participant identifier
  name: string;         // Display name (user-provided or guest)
  roomHandle: string;   // Room they belong to
  joinedAt: Date;       // Timestamp of joining
}
```

### Room Interface

```typescript
export interface Room {
  handle: string;                           // Room identifier
  participants: Map<string, Participant>;  // Active participants
  createdBy?: string;                      // Creator participant ID
  createdAt: Date;                         // Room creation timestamp
}
```

### Extended WebSocket Interface

```typescript
export interface ExtendedWebSocket extends WebSocket {
  participantId?: string;  // Associated participant
  roomHandle?: string;     // Current room
  name?: string;          // Participant name
}
```

## Room Validation System

### Server-Side Validation

Located at `app/api/room/route.ts`

```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomHandle = searchParams.get('roomHandle');

    if (!roomHandle) {
      return NextResponse.json(
        { error: 'Room handle is required' },
        { status: 400 }
      );
    }

    const room = await roomService.findRoom(roomHandle);
    
    return NextResponse.json({
      exists: true,
      room: {
        handle: room.handle,
        participantCount: room.participants?.length || 0,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof RoomNotFoundError) {
      return NextResponse.json(
        { exists: false, error: 'Room not found' },
        { status: 404 }
      );
    }
    // ... other error handling
  }
}
```

### Client-Side Room Verification

Located at `app/room/[roomHandle]/page.tsx`

```typescript
useEffect(() => {
  const verifyRoom = async () => {
    try {
      const response = await fetch(
        `/api/room?roomHandle=${encodeURIComponent(roomHandle)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          toast.error(`Room "${roomHandle}" does not exist`);
          router.push('/');
          return;
        }
        throw new Error('Failed to verify room');
      }

      setRoomExists(true);
    } catch (error) {
      console.error('Failed to verify room:', error);
      toast.error('Failed to verify room');
      router.push('/');
    }
  };

  if (roomHandle) {
    verifyRoom().catch(console.error);
  }
}, [roomHandle, router]);
```

## User Interface Integration

### Home Page Form

```tsx
<form className='space-y-6'>
  {/* Name Input */}
  <div>
    <label htmlFor='name' className='text-card-foreground mb-2 block text-sm font-medium'>
      Your Name (Optional)
    </label>
    <Input 
      id='name' 
      {...register('name')} 
      type='text' 
      placeholder='Enter your name' 
      className='w-full transition-colors' 
      disabled={isPending} 
    />
    {errors.name && (
      <p className='text-destructive mt-1 text-xs'>{errors.name.message}</p>
    )}
    <p className='text-muted-foreground mt-1 text-xs'>
      Leave empty to join as a guest
    </p>
  </div>

  {/* Room Handle Input */}
  <div>
    <label htmlFor='roomHandle' className='text-card-foreground mb-2 block text-sm font-medium'>
      Room Name
    </label>
    <Input 
      id='roomHandle' 
      {...register('roomHandle')} 
      type='text' 
      placeholder='Enter room name' 
      className='w-full transition-colors' 
      disabled={isPending} 
    />
    {/* Error handling */}
  </div>
</form>
```

### Meeting Room Participant Display

```tsx
// Local user name retrieval
useEffect(() => {
  const userName = sessionStorage.getItem('userName');
  if (userName?.trim()) {
    setCurrentUserName(userName.trim());
  } else {
    // Find current user in participants list to get assigned guest name
    const currentParticipant = participants.find(p => p.id === participantId);
    if (currentParticipant?.name) {
      setCurrentUserName(currentParticipant.name);
    }
  }
}, [participantId, participants]);

// Helper function for remote participant names
const getParticipantName = (participantId: string): string => {
  const participant = participants.find(p => p.id === participantId);
  return participant?.name ?? 'Unknown';
};
```

### Room Termination Handling

```tsx
// In useWebRTC hook
case 'room-terminated':
  console.log('Room was terminated:', message.reason);
  setState(prev => ({ ...prev, error: 'Room has been terminated' }));
  
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.close();
  }
  
  if (typeof window !== 'undefined') {
    const reason = message.reason ?? 'unknown';
    window.location.href = `/room-terminated?reason=${String(reason)}`;
  }
  break;
```

## Room Termination Page

### Termination Reasons

Located at `app/room-terminated/page.tsx`

```typescript
const getReasonMessage = () => {
  switch (reason) {
    case 'creator-left':
      return 'The room host has left the meeting.';
    case 'room-closed':
      return 'The meeting room has been closed.';
    default:
      return 'The meeting has ended.';
  }
};
```

### Auto-Redirect Timer

```typescript
const [countdown, setCountdown] = useState(30);

useEffect(() => {
  const timer = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        router.push('/');
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [router]);
```

## Error Handling

### Room Creation Errors

```typescript
try {
  await createRoomAction(data.roomHandle, data.name);
} catch (error) {
  if (error instanceof RoomAlreadyExistsError) {
    toast.error('Room already exists. Please choose a different name.');
  } else {
    toast.error('Failed to create room. Please try again.');
  }
}
```

### Participant Management Errors

```typescript
// WebSocket connection handling
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  setState(prev => ({ 
    ...prev, 
    error: 'Connection failed. Please refresh the page.' 
  }));
};

ws.onclose = () => {
  console.log('WebSocket disconnected');
  setState(prev => ({ ...prev, isConnected: false }));
  
  // Attempt reconnection after delay
  setTimeout(() => {
    initializeWebSocket();
  }, 3000);
};
```

## Security Considerations

### Room Handle Validation

```typescript
// Client-side validation
const roomFormSchema = z.object({
  roomHandle: z.string()
    .min(2, 'Room name must be at least 2 characters')
    .max(50, 'Room name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Room name can only contain letters, numbers, hyphens, and underscores'),
});

// Server-side validation
export class CreateRoomDto {
  @IsString()
  @Length(2, 50)
  @Matches(/^[a-zA-Z0-9-_]+$/)
  handle!: string;
}
```

### Participant ID Generation

```typescript
const generateParticipantId = useCallback(() => {
  return `participant_${Date.now().toString()}_${Math.random().toString(36).substring(2, 9)}`;
}, []);
```

### WebSocket Message Validation

```typescript
function handleJoinRoom(ws: ExtendedWebSocket, message: WebSocketMessage): void {
  if (message.type !== 'join-room') return;

  const { participantId, roomHandle, name, isCreator } = message;

  if (!participantId || !roomHandle) {
    sendError(ws, 'Missing participantId or roomHandle');
    return;
  }

  // Sanitize name input
  const sanitizedName = name?.trim().slice(0, 30) || undefined;

  roomManager?.joinRoom(ws, roomHandle, participantId, sanitizedName, isCreator);
}
```

## Performance Optimizations

### Memory Management

```typescript
// Clean up empty rooms
if (room.participants.size === 0) {
  this.rooms.delete(roomHandle);
  console.log(`Room ${roomHandle} cleaned up (empty)`);
}

// Limit participant tracking
private participants = new Map<string, ParticipantData>();
private rooms = new Map<string, Room>();

// Regular cleanup for stale connections
setInterval(() => {
  this.cleanupStaleConnections();
}, 60000); // Every minute
```

### Efficient Broadcasts

```typescript
private broadcastToRoom(roomHandle: string, message: object): void {
  const room = this.rooms.get(roomHandle);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  
  for (const participantId of room.participants.keys()) {
    const participantData = this.participants.get(participantId);
    if (participantData?.ws.readyState === WebSocket.OPEN) {
      participantData.ws.send(messageStr);
    }
  }
}
```

## Testing Guidelines

### User Name Testing

1. **Empty Names**: Test guest assignment with no name provided
2. **Special Characters**: Test name validation and sanitization
3. **Long Names**: Test maximum length enforcement
4. **Duplicate Names**: Test handling of multiple users with same name

### Room Management Testing

1. **Room Creation**: Test creating rooms with various handles
2. **Room Joining**: Test joining existing and non-existent rooms
3. **Creator Leave**: Test room termination when creator leaves
4. **Participant Leave**: Test normal leave behavior
5. **Concurrent Users**: Test multiple users in same room

### Edge Cases

1. **Network Interruption**: Test reconnection behavior
2. **Browser Refresh**: Test session persistence
3. **Tab Switching**: Test connection management
4. **Device Changes**: Test participant list updates

## Future Enhancements

### Planned Features

- **Room Passwords**: Private room protection
- **User Profiles**: Persistent user accounts
- **Room Moderation**: Kick/ban participants
- **Room Scheduling**: Scheduled meetings
- **Recording Management**: Room-based recording controls

### Technical Improvements

- **Database Persistence**: Move from in-memory to persistent storage
- **Horizontal Scaling**: Multiple server instance support
- **Rate Limiting**: Prevent spam/abuse
- **Analytics**: Room usage and participant metrics 