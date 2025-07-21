import {
  type CreateRoomData,
  type Room,
  RoomNotFoundError,
  type RoomSearchCriteria,
  RoomValidationError,
} from '../model';
import { type IRoomRepository } from '../repository/interface';
import type { IRoomService } from './interface';

export class RoomService implements IRoomService {
  constructor(private roomRepository: IRoomRepository) {}

  async createRoom(data: CreateRoomData): Promise<Room> {
    // Validate input
    this.validateCreateRoomData(data);

    // Generate unique room ID
    const roomId = this.generateRoomId();

    // Create room object
    const room: Room = {
      id: roomId,
      handle: data.roomHandle,
      createdBy: data.userId,
      createdAt: new Date(),
      participants: [data.userId],
    };

    // Save to repository
    return await this.roomRepository.create(room);
  }

  async getRoomById(roomId: string): Promise<Room> {
    if (!roomId || roomId.trim().length === 0) {
      throw new RoomValidationError('Room ID is required');
    }

    const room = await this.roomRepository.findById(roomId.trim());
    if (!room) {
      throw new RoomNotFoundError(`Room with ID '${roomId}' not found`);
    }

    return room;
  }

  async getRoomByHandle(handle: string): Promise<Room> {
    if (!handle || handle.trim().length === 0) {
      throw new RoomValidationError('Room handle is required');
    }

    const room = await this.roomRepository.findByHandle(handle.trim());
    if (!room) {
      throw new RoomNotFoundError(`Room with handle '${handle}' not found`);
    }

    return room;
  }

  async findRoom(criteria: RoomSearchCriteria): Promise<Room> {
    if (criteria.roomId) {
      return await this.getRoomById(criteria.roomId);
    }

    if (criteria.roomHandle) {
      return await this.getRoomByHandle(criteria.roomHandle);
    }

    throw new RoomValidationError(
      'Either roomId or roomHandle must be provided',
    );
  }

  async addParticipantToRoom(roomId: string, userId: string): Promise<Room> {
    if (!userId || userId.trim().length === 0) {
      throw new RoomValidationError('User ID is required');
    }

    await this.roomRepository.addParticipant(roomId, userId.trim());
    return await this.getRoomById(roomId);
  }

  async removeParticipantFromRoom(
    roomId: string,
    userId: string,
  ): Promise<Room> {
    if (!userId || userId.trim().length === 0) {
      throw new RoomValidationError('User ID is required');
    }

    await this.roomRepository.removeParticipant(roomId, userId.trim());
    return await this.getRoomById(roomId);
  }

  async getAllRooms(): Promise<Room[]> {
    return await this.roomRepository.getAll();
  }

  private validateCreateRoomData(data: CreateRoomData): void {
    if (!data.userId || data.userId.trim().length === 0) {
      throw new RoomValidationError('User ID is required');
    }

    if (!data.roomHandle || data.roomHandle.trim().length === 0) {
      throw new RoomValidationError('Room handle is required');
    }

    // Additional business rules can be added here
    if (data.roomHandle.length > 50) {
      throw new RoomValidationError(
        'Room handle must be 50 characters or less',
      );
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(data.roomHandle)) {
      throw new RoomValidationError(
        'Room handle can only contain letters, numbers, hyphens, and underscores',
      );
    }
  }

  private generateRoomId(): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 11);
    return `room_${timestamp.toString()}_${randomStr}`;
  }
}
