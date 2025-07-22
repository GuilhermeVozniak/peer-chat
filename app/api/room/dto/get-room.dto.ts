// Get Room Request DTO
export interface GetRoomRequestDto {
  roomId?: string;
  roomHandle?: string;
}

// Get Room Response DTO
export interface GetRoomResponseDto {
  roomId: string;
  roomHandle: string;
  createdBy: string;
  createdAt: Date;
  participants: string[];
}
