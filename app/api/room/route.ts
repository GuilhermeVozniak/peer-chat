import { NextResponse, type NextRequest } from 'next/server';
import {
  validateCreateRoomRequest,
  validateGetRoomRequest,
  type CreateRoomResponseDto,
  type ErrorResponseDto,
  type GetRoomResponseDto,
} from './dto';
import {
  RoomAlreadyExistsError,
  RoomNotFoundError,
  RoomValidationError,
} from './model';
import { getRoomService } from './service/instance';

// Get room service instance
const roomService = getRoomService();

// POST /api/room - Create a new room
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request
    const body = (await request.json()) as unknown;
    const createRoomData = validateCreateRoomRequest(body);

    // Create room via service
    const room = await roomService.createRoom(createRoomData);

    // Map to response DTO
    const response: CreateRoomResponseDto = {
      roomId: room.id,
      roomHandle: room.handle,
      userId: room.createdBy,
      createdAt: room.createdAt,
      participants: room.participants,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/room - Get room information
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const roomHandle = searchParams.get('roomHandle');

    const getRoomData = validateGetRoomRequest(roomId, roomHandle);

    // Get room via service
    const room = await roomService.findRoom(getRoomData);

    // Map to response DTO
    const response: GetRoomResponseDto = {
      roomId: room.id,
      roomHandle: room.handle,
      createdBy: room.createdBy,
      createdAt: room.createdAt,
      participants: room.participants,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
}

// Error handler
function handleError(error: unknown): NextResponse {
  console.error('Room API Error:', error);

  let response: ErrorResponseDto;
  let status: number;

  if (error instanceof RoomValidationError) {
    response = { error: error.message };
    status = 400;
  } else if (error instanceof RoomAlreadyExistsError) {
    response = { error: error.message };
    status = 409;
  } else if (error instanceof RoomNotFoundError) {
    response = { error: error.message };
    status = 404;
  } else if (error instanceof Error) {
    response = { error: error.message };
    status = 400;
  } else {
    response = { error: 'Internal server error' };
    status = 500;
  }

  return NextResponse.json(response, { status });
}
