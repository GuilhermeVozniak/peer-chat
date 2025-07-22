export interface Room {
  id: string; // Backend-generated room ID
  handle: string; // User-provided room handle
  createdBy: string; // User ID who created the room
  createdAt: Date;
  participants: string[]; // Array of user IDs in the room
}

export interface CreateRoomData {
  userId: string;
  roomHandle: string;
}

export interface RoomSearchCriteria {
  roomId?: string;
  roomHandle?: string;
}

// Room business rules
export class RoomValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoomValidationError';
  }
}

export class RoomNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoomNotFoundError';
  }
}

export class RoomAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoomAlreadyExistsError';
  }
}
