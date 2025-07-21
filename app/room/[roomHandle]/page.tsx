'use client';

import { Video } from '@/components/common/Video';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function MeetingRoom() {
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const params = useParams();
  const router = useRouter();
  const roomHandle = params.roomHandle as string;

  // Use WebRTC hook for video conferencing
  const {
    localStream,
    remoteStreams,
    participants,
    isConnected,
    error,
    participantId,
  } = useWebRTC(roomHandle);

  // Verify room exists before initializing
  useEffect(() => {
    const verifyRoom = async () => {
      try {
        const response = await fetch(
          `/api/room?roomHandle=${encodeURIComponent(roomHandle)}`,
        );

        if (!response.ok) {
          if (response.status === 404) {
            toast.error(`Room "${roomHandle}" does not exist`);
            router.push('/');
            return;
          }
          throw new Error('Failed to verify room');
        }

        setRoomExists(true);
      } catch (error) {
        console.error('Failed to verify room:', error);
        toast.error('Failed to verify room');
        router.push('/');
      }
    };

    if (roomHandle) {
      verifyRoom().catch((error: unknown) => {
        console.error('Failed to verify room:', error);
      });
    }
  }, [roomHandle, router]);

  // Show WebRTC errors as toasts
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Show loading state while verifying room
  if (roomExists === null) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center'>
        <div className='flex items-center space-x-2'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
          <span className='text-lg'>Verifying room...</span>
        </div>
      </div>
    );
  }

  // Don't render the room if it doesn't exist
  if (!roomExists) {
    return null;
  }

  // Calculate optimal grid layout for Google Meet-style experience
  const totalParticipants = 1 + remoteStreams.length;
  const getGridLayout = () => {
    if (totalParticipants === 1) {
      return {
        gridCols: 'grid-cols-1',
        gridRows: 'grid-rows-1',
        maxParticipants: 1,
      };
    }
    if (totalParticipants === 2) {
      return {
        gridCols: 'grid-cols-2',
        gridRows: 'grid-rows-1',
        maxParticipants: 2,
      };
    }
    if (totalParticipants <= 4) {
      return {
        gridCols: 'grid-cols-2',
        gridRows: 'grid-rows-2',
        maxParticipants: 4,
      };
    }
    if (totalParticipants <= 6) {
      return {
        gridCols: 'grid-cols-3',
        gridRows: 'grid-rows-2',
        maxParticipants: 6,
      };
    }
    return {
      gridCols: 'grid-cols-3',
      gridRows: 'grid-rows-3',
      maxParticipants: 9,
    };
  };

  const layout = getGridLayout();

  return (
    <div className='flex max-h-screen min-h-screen flex-col overflow-hidden bg-gray-900'>
      {/* Header */}
      <header className='flex-shrink-0 border-b border-gray-700 bg-gray-800 p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-semibold text-white'>
              Room: {roomHandle}
            </h1>
            <p className='text-sm text-gray-300'>
              {totalParticipants} participant
              {totalParticipants !== 1 ? 's' : ''}
            </p>
          </div>
          <div className='flex items-center space-x-4 text-sm'>
            <div className='flex items-center space-x-2'>
              <div
                className={`h-3 w-3 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
              ></div>
              <span className='text-gray-300'>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main video area */}
      <main className='flex-1 overflow-hidden p-4'>
        {totalParticipants === 1 ? (
          // Single participant - full screen with waiting message
          <div className='flex h-full items-center justify-center'>
            <div className='w-full max-w-4xl'>
              <div className='relative aspect-video w-full overflow-hidden rounded-lg bg-gray-800 shadow-lg'>
                <Video id={participantId} stream={localStream} />
                <div className='bg-opacity-50 absolute bottom-4 left-4 rounded bg-black px-3 py-1 text-white'>
                  You
                </div>
              </div>
              <div className='mt-6 text-center'>
                <div className='mb-4 text-6xl'>👥</div>
                <h2 className='mb-2 text-xl font-medium text-white'>
                  Waiting for others to join
                </h2>
                <p className='text-gray-400'>
                  Share the room link to invite participants
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Multiple participants - grid layout
          <div className='h-full w-full'>
            <div
              className={`grid h-full w-full gap-3 ${layout.gridCols} ${layout.gridRows}`}
            >
              {/* Local video */}
              <div className='relative overflow-hidden rounded-lg bg-gray-800 shadow-lg'>
                <Video id={participantId} stream={localStream} />
                <div className='bg-opacity-70 absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-xs font-medium text-white'>
                  You
                </div>
              </div>

              {/* Remote videos */}
              {remoteStreams
                .slice(0, layout.maxParticipants - 1)
                .map((remoteStream, index) => (
                  <div
                    key={remoteStream.participantId}
                    className='relative overflow-hidden rounded-lg bg-gray-800 shadow-lg'
                  >
                    <Video
                      id={remoteStream.participantId}
                      stream={remoteStream.stream}
                    />
                    <div className='bg-opacity-70 absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-xs font-medium text-white'>
                      Participant {index + 1}
                    </div>
                  </div>
                ))}

              {/* Show "+N more" if there are too many participants */}
              {remoteStreams.length > layout.maxParticipants - 1 && (
                <div className='flex items-center justify-center rounded-lg bg-gray-700 shadow-lg'>
                  <div className='text-center text-white'>
                    <div className='mb-2 text-3xl'>+</div>
                    <div className='text-sm font-medium'>
                      {remoteStreams.length - (layout.maxParticipants - 1)} more
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Debug info - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className='flex-shrink-0 border-t border-gray-700 bg-gray-800 p-3'>
          <div className='text-xs text-gray-400'>
            <span className='mr-4'>ID: {participantId}</span>
            <span className='mr-4'>Participants: {participants.length}</span>
            <span className='mr-4'>Streams: {remoteStreams.length}</span>
            <span>
              Grid: {layout.gridCols} {layout.gridRows}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
