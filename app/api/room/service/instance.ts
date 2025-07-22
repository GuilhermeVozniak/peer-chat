import { getRoomRepository } from '../repository/instance';
import { RoomService } from './impl';
import type { IRoomService } from './interface';

// Singleton instance
const roomService = new RoomService(getRoomRepository());
export const getRoomService = (): IRoomService => roomService;
