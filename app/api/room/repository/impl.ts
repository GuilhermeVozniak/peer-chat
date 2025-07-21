import { type Room, RoomAlreadyExistsError, RoomNotFoundError } from '../model';
import type { IRoomRepository } from './interface';

export class InMemoryRoomRepository implements IRoomRepository {
  private rooms = new Map<string, Room>();
  private roomHandles = new Map<string, string>(); // Maps handle -> roomId for quick lookup

  create(room: Room): Promise<Room> {
    // Check if room handle already exists
    if (this.roomHandles.has(room.handle)) {
      throw new RoomAlreadyExistsError(
        `Room with handle '${room.handle}' already exists`,
      );
    }

    // Check if room ID already exists (should not happen with proper ID generation)
    if (this.rooms.has(room.id)) {
      throw new RoomAlreadyExistsError(
        `Room with ID '${room.id}' already exists`,
      );
    }

    // Store the room
    this.rooms.set(room.id, { ...room });
    this.roomHandles.set(room.handle, room.id);

    return Promise.resolve({ ...room });
  }

  findById(roomId: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    return Promise.resolve(room ? { ...room } : null);
  }

  findByHandle(handle: string): Promise<Room | null> {
    const roomId = this.roomHandles.get(handle);
    if (!roomId) {
      return Promise.resolve(null);
    }

    const room = this.rooms.get(roomId);
    return Promise.resolve(room ? { ...room } : null);
  }

  addParticipant(roomId: string, userId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new RoomNotFoundError(`Room with ID '${roomId}' not found`);
    }

    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
    }
    return Promise.resolve(true);
  }

  removeParticipant(roomId: string, userId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new RoomNotFoundError(`Room with ID '${roomId}' not found`);
    }

    const index = room.participants.indexOf(userId);
    if (index > -1) {
      room.participants.splice(index, 1);
    }
    return Promise.resolve(true);
  }

  getAll(): Promise<Room[]> {
    return Promise.resolve(
      Array.from(this.rooms.values()).map((room) => ({ ...room })),
    );
  }

  handleExists(handle: string): Promise<boolean> {
    return Promise.resolve(this.roomHandles.has(handle));
  }
}
