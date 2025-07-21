import { InMemoryRoomRepository } from './impl';
import type { IRoomRepository } from './interface';

// Singleton instance
const roomRepository = new InMemoryRoomRepository();
export const getRoomRepository = (): IRoomRepository => roomRepository;
