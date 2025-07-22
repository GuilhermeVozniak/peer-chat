import { WebSocket } from 'ws';
import type {
  ErrorMessage,
  ExtendedWebSocket,
  Participant,
  ParticipantJoinedMessage,
  ParticipantLeftMessage,
  Room,
  RoomStateMessage,
  RoomTerminatedMessage,
  WebSocketMessage,
} from '../types/websocket';

export class RoomManager {
  private rooms = new Map<string, Room>();
  private participants = new Map<string, ExtendedWebSocket>();

  // Join a participant to a room
  joinRoom(
    ws: ExtendedWebSocket,
    roomHandle: string,
    participantId: string,
    name?: string,
    isCreator?: boolean,
  ): void {
    try {
      // Get or create room
      if (!this.rooms.has(roomHandle)) {
        this.rooms.set(roomHandle, {
          handle: roomHandle,
          participants: new Map(),
          createdBy: isCreator ? participantId : undefined,
          createdAt: new Date(),
        });
      }

      const room = this.rooms.get(roomHandle);
      if (!room) return;

      // If this is the first participant and no creator is set, make them the creator
      if (!room.createdBy && room.participants.size === 0) {
        room.createdBy = participantId;
      }

      // Generate name if not provided (Guest 1, Guest 2, etc.)
      let participantName = name?.trim();
      participantName ??= this.generateGuestName(roomHandle);

      // Create participant
      const participant: Participant = {
        id: participantId,
        name: participantName,
        roomHandle,
        joinedAt: new Date(),
      };

      // Add participant to room and tracking
      room.participants.set(participantId, participant);
      this.participants.set(participantId, ws);

      // Update WebSocket with participant info
      ws.participantId = participantId;
      ws.roomHandle = roomHandle;
      ws.name = participantName;
      ws.isAlive = true;

      console.log(
        `Participant ${participantId} (${participantName}) joined room ${roomHandle}${
          room.createdBy === participantId ? ' as creator' : ''
        }`,
      );

      // Send current room state to the new participant
      this.sendRoomState(ws, roomHandle);

      // Notify other participants about the new joiner
      this.broadcastToRoom(
        roomHandle,
        {
          type: 'participant-joined',
          participantId,
          roomHandle,
          timestamp: Date.now(),
          participant,
        } as ParticipantJoinedMessage,
        participantId,
      );
    } catch (error) {
      console.error('Error joining room:', error);
      this.sendError(
        ws,
        'Failed to join room',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  // Generate guest name for participants without a name
  private generateGuestName(roomHandle: string): string {
    const room = this.rooms.get(roomHandle);
    if (!room) return 'Guest 1';

    // Count existing guests to determine next guest number
    const existingParticipants = Array.from(room.participants.values());
    const guestNames = existingParticipants
      .map((p) => p.name)
      .filter((name) => name.startsWith('Guest '))
      .map((name) => parseInt(name.replace('Guest ', ''), 10))
      .filter((num) => !isNaN(num))
      .sort((a, b) => a - b);

    // Find the next available guest number
    let guestNumber = 1;
    for (const num of guestNames) {
      if (num === guestNumber) {
        guestNumber++;
      } else {
        break;
      }
    }

    return `Guest ${guestNumber.toString()}`;
  }

  // Remove a participant from a room
  leaveRoom(participantId: string): void {
    try {
      const ws = this.participants.get(participantId);
      if (!ws?.roomHandle) return;

      const roomHandle = ws.roomHandle;
      const room = this.rooms.get(roomHandle);
      if (!room) return;

      const isCreator = room.createdBy === participantId;

      // Remove participant from room
      room.participants.delete(participantId);
      this.participants.delete(participantId);

      console.log(
        `Participant ${participantId} left room ${roomHandle}${
          isCreator ? ' (was creator)' : ''
        }`,
      );

      // If creator left, terminate the room for everyone
      if (isCreator) {
        this.terminateRoom(roomHandle, 'creator-left');
      } else {
        // Notify other participants about the departure
        this.broadcastToRoom(roomHandle, {
          type: 'participant-left',
          participantId,
          roomHandle,
          timestamp: Date.now(),
        } as ParticipantLeftMessage);

        // Clean up empty rooms
        if (room.participants.size === 0) {
          this.rooms.delete(roomHandle);
          console.log(`Room ${roomHandle} deleted (no participants)`);
        }
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  // Terminate a room and notify all participants
  private terminateRoom(
    roomHandle: string,
    reason: 'creator-left' | 'room-closed',
  ): void {
    try {
      const room = this.rooms.get(roomHandle);
      if (!room) return;

      console.log(`Terminating room ${roomHandle}: ${reason}`);

      // Notify all participants that the room is terminated
      const terminationMessage: RoomTerminatedMessage = {
        type: 'room-terminated',
        participantId: 'system',
        roomHandle,
        timestamp: Date.now(),
        reason,
      };

      // Send termination message to all participants in the room
      room.participants.forEach((participant) => {
        const ws = this.participants.get(participant.id);
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(terminationMessage));
        }
        // Remove participant from tracking
        this.participants.delete(participant.id);
      });

      // Remove the room
      this.rooms.delete(roomHandle);
      console.log(`Room ${roomHandle} terminated and cleaned up`);
    } catch (error) {
      console.error('Error terminating room:', error);
    }
  }

  // Handle WebSocket disconnection
  handleDisconnection(ws: ExtendedWebSocket): void {
    if (ws.participantId) {
      this.leaveRoom(ws.participantId);
    }
  }

  // Forward WebRTC signaling messages between participants
  forwardSignalingMessage(
    fromParticipantId: string,
    message: WebSocketMessage,
  ): void {
    try {
      if (
        message.type === 'webrtc-offer' ||
        message.type === 'webrtc-answer' ||
        message.type === 'webrtc-ice-candidate'
      ) {
        const targetWs = this.participants.get(message.targetParticipantId);
        if (targetWs?.readyState === WebSocket.OPEN) {
          targetWs.send(JSON.stringify(message));
        } else {
          console.warn(
            `Target participant ${message.targetParticipantId} not found or disconnected`,
          );
        }
      }
    } catch (error) {
      console.error('Error forwarding signaling message:', error);
    }
  }

  // Send current room state to a participant
  private sendRoomState(ws: ExtendedWebSocket, roomHandle: string): void {
    const room = this.rooms.get(roomHandle);
    if (!room || !ws.participantId) return;

    const participants = Array.from(room.participants.values());

    const message: RoomStateMessage = {
      type: 'room-state',
      participantId: ws.participantId ?? 'unknown',
      roomHandle,
      timestamp: Date.now(),
      participants,
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Broadcast message to all participants in a room (except sender)
  private broadcastToRoom(
    roomHandle: string,
    message: WebSocketMessage,
    excludeParticipantId?: string,
  ): void {
    const room = this.rooms.get(roomHandle);
    if (!room) return;

    room.participants.forEach((participant) => {
      if (participant.id === excludeParticipantId) return;

      const ws = this.participants.get(participant.id);
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  // Send error message to a participant
  private sendError(
    ws: ExtendedWebSocket,
    error: string,
    details?: string,
  ): void {
    if (!ws.participantId || !ws.roomHandle) return;

    const message: ErrorMessage = {
      type: 'error',
      participantId: ws.participantId ?? 'unknown',
      roomHandle: ws.roomHandle ?? 'unknown',
      timestamp: Date.now(),
      error,
      details,
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Get room information
  getRoomInfo(roomHandle: string): Room | undefined {
    return this.rooms.get(roomHandle);
  }

  // Get participant count for a room
  getParticipantCount(roomHandle: string): number {
    const room = this.rooms.get(roomHandle);
    return room ? room.participants.size : 0;
  }

  // Health check - remove dead connections
  cleanup(): void {
    this.participants.forEach((ws, participantId) => {
      if (!ws.isAlive || ws.readyState !== WebSocket.OPEN) {
        this.leaveRoom(participantId);
      } else {
        ws.isAlive = false;
        if (Number(ws.readyState) === WebSocket.OPEN) {
          ws.ping();
        }
      }
    });
  }
}
