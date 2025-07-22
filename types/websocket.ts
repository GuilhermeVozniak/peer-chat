// WebSocket message types for video conferencing
import type { WebSocket } from 'ws';

export interface Participant {
  id: string;
  name: string;
  roomHandle: string;
  joinedAt: Date;
}

export interface Room {
  handle: string;
  participants: Map<string, Participant>;
  createdBy?: string; // ID of the participant who created the room
  createdAt: Date;
}

// Base message structure
export interface BaseMessage {
  type: string;
  participantId: string;
  roomHandle: string;
  timestamp: number;
}

// Room management messages
export interface JoinRoomMessage extends BaseMessage {
  type: 'join-room';
  name?: string; // Optional user name
  isCreator?: boolean; // Whether this participant is creating the room
}

export interface LeaveRoomMessage extends BaseMessage {
  type: 'leave-room';
}

export interface ParticipantJoinedMessage extends BaseMessage {
  type: 'participant-joined';
  participant: Participant;
}

export interface ParticipantLeftMessage extends BaseMessage {
  type: 'participant-left';
  participantId: string;
}

export interface RoomStateMessage extends BaseMessage {
  type: 'room-state';
  participants: Participant[];
}

export interface RoomTerminatedMessage extends BaseMessage {
  type: 'room-terminated';
  reason: 'creator-left' | 'room-closed';
}

// WebRTC signaling messages
export interface OfferMessage extends BaseMessage {
  type: 'webrtc-offer';
  targetParticipantId: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerMessage extends BaseMessage {
  type: 'webrtc-answer';
  targetParticipantId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateMessage extends BaseMessage {
  type: 'webrtc-ice-candidate';
  targetParticipantId: string;
  candidate: RTCIceCandidateInit;
}

// Error messages
export interface ErrorMessage extends BaseMessage {
  type: 'error';
  error: string;
  details?: string;
}

// Union type for all possible messages
export type WebSocketMessage =
  | JoinRoomMessage
  | LeaveRoomMessage
  | ParticipantJoinedMessage
  | ParticipantLeftMessage
  | RoomStateMessage
  | RoomTerminatedMessage
  | OfferMessage
  | AnswerMessage
  | IceCandidateMessage
  | ErrorMessage;

// WebSocket connection with participant info
export interface ExtendedWebSocket extends WebSocket {
  participantId?: string;
  roomHandle?: string;
  name?: string;
  isAlive?: boolean;
}
