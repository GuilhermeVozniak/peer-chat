'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { generateUserId } from '@/lib/utils.server';

// Helper functions
async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

export async function createRoomAction(roomHandle: string) {
  const userId = generateUserId();

  if (!roomHandle || roomHandle.trim() === '') {
    throw new Error('Room handle is required');
  }

  try {
    const response = await fetch(`${await getBaseUrl()}/api/room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        roomHandle: roomHandle.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      throw new Error(errorData.error ?? 'Failed to create room');
    }

    const roomData = (await response.json()) as { roomHandle: string };
    redirect(`/room/${roomData.roomHandle}`);
  } catch (error) {
    // Don't log redirect errors - they're expected Next.js behavior
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect to let Next.js handle it
    }
    // Only log actual errors
    console.error('Error creating room:', error);
    throw error;
  }
}

export async function joinRoomAction(roomHandle: string) {
  if (!roomHandle || roomHandle.trim() === '') {
    throw new Error('Room handle is required');
  }

  try {
    const response = await fetch(
      `${await getBaseUrl()}/api/room?roomHandle=${encodeURIComponent(roomHandle.trim())}`,
    );

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      throw new Error(errorData.error ?? 'Room not found');
    }

    const roomData = (await response.json()) as { roomHandle: string };
    redirect(`/room/${roomData.roomHandle}`);
  } catch (error) {
    // Don't log redirect errors - they're expected Next.js behavior
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect to let Next.js handle it
    }
    // Only log actual errors
    throw error;
  }
}
