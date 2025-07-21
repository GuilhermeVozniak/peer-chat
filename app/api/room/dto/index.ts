// Export all DTOs from their respective files
export type {
  CreateRoomRequestDto,
  CreateRoomResponseDto,
} from './create-room.dto';
export type { GetRoomRequestDto, GetRoomResponseDto } from './get-room.dto';
export type { ErrorResponseDto } from './error.dto';

// Export validation functions
export {
  validateCreateRoomRequest,
  validateGetRoomRequest,
} from './validation';
