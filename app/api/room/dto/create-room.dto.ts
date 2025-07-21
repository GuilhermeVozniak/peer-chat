// Create Room Request DTO
export interface CreateRoomRequestDto {
  userId: string;
  roomHandle: string;
}

// Create Room Response DTO
export interface CreateRoomResponseDto {
  roomId: string;
  roomHandle: string;
  userId: string;
  createdAt: Date;
  participants: string[];
}
