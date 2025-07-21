import { useState, useEffect } from 'react';
import { useDebounce } from '@uidotdev/usehooks';

export interface RoomValidationResult {
  isValid: boolean | null; // null = not checked yet, true = exists, false = doesn't exist
  isLoading: boolean;
  error: string | null;
}

export function useRoomValidation(
  roomHandle: string,
  delay = 500,
): RoomValidationResult {
  const [result, setResult] = useState<RoomValidationResult>({
    isValid: null,
    isLoading: false,
    error: null,
  });

  // Debounce the room handle input
  const debouncedRoomHandle = useDebounce(roomHandle, delay);

  useEffect(() => {
    // Don't validate empty or very short handles
    if (!debouncedRoomHandle || debouncedRoomHandle.trim().length < 2) {
      setResult({ isValid: null, isLoading: false, error: null });
      return;
    }

    const checkRoom = async () => {
      setResult((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(
          `/api/room?roomHandle=${encodeURIComponent(debouncedRoomHandle.trim())}`,
        );

        if (response.ok) {
          setResult({ isValid: true, isLoading: false, error: null });
        } else if (response.status === 404) {
          setResult({
            isValid: false,
            isLoading: false,
            error: 'Room not found',
          });
        } else {
          const errorData = (await response.json()) as { error: string };
          setResult({
            isValid: false,
            isLoading: false,
            error: errorData.error || 'Failed to validate room',
          });
        }
      } catch (_) {
        setResult({
          isValid: false,
          isLoading: false,
          error: 'Network error while validating room',
        });
      }
    };

    checkRoom().catch((error: unknown) => {
      console.error('Failed to validate room:', error);
      setResult({
        isValid: false,
        isLoading: false,
        error: 'Failed to validate room',
      });
    });
  }, [debouncedRoomHandle]);

  return result;
}
