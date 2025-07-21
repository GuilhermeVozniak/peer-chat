import {
  type CreateRoomData,
  type Room,
  type RoomSearchCriteria,
} from '../model';

export interface IRoomService {
  createRoom(data: CreateRoomData): Promise<Room>;
  getRoomById(roomId: string): Promise<Room>;
  getRoomByHandle(handle: string): Promise<Room>;
  findRoom(criteria: RoomSearchCriteria): Promise<Room>;
  addParticipantToRoom(roomId: string, userId: string): Promise<Room>;
  removeParticipantFromRoom(roomId: string, userId: string): Promise<Room>;
  getAllRooms(): Promise<Room[]>;
}
