import type { CreateRoomRequestDto } from './create-room.dto';
import type { GetRoomRequestDto } from './get-room.dto';

// Validation helpers
export function validateCreateRoomRequest(body: unknown): CreateRoomRequestDto {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required');
  }

  const { userId, roomHandle } = body as Record<string, unknown>;

  if (!userId || typeof userId !== 'string') {
    throw new Error('userId is required and must be a string');
  }

  if (!roomHandle || typeof roomHandle !== 'string') {
    throw new Error('roomHandle is required and must be a string');
  }

  if (roomHandle.trim().length === 0) {
    throw new Error('roomHandle must be a non-empty string');
  }

  return {
    userId: userId.trim(),
    roomHandle: roomHandle.trim(),
  };
}

export function validateGetRoomRequest(
  roomId?: string | null,
  roomHandle?: string | null,
): GetRoomRequestDto {
  if (!roomId && !roomHandle) {
    throw new Error('Either roomId or roomHandle parameter is required');
  }

  return {
    roomId: roomId ?? undefined,
    roomHandle: roomHandle ?? undefined,
  };
}
