import { type Room } from '../model';

export interface IRoomRepository {
  create(room: Room): Promise<Room>;
  findById(roomId: string): Promise<Room | null>;
  findByHandle(handle: string): Promise<Room | null>;
  addParticipant(roomId: string, userId: string): Promise<boolean>;
  removeParticipant(roomId: string, userId: string): Promise<boolean>;
  getAll(): Promise<Room[]>;
  handleExists(handle: string): Promise<boolean>;
}
