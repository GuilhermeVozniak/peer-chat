'use client';

import { Video } from '@/components/common/Video';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

export default function MeetingRoom() {
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('You');
  const params = useParams();
  const router = useRouter();
  const roomHandle = params.roomHandle as string;
  const leavingRef = useRef(false);

  // Use WebRTC hook for video conferencing
  const {
    localStream,
    remoteStreams,
    isConnected,
    error,
    participantId,
    participants,
    leaveRoom,
  } = useWebRTC(roomHandle);

  // Handle leaving the meeting
  const handleLeaveMeeting = () => {
    if (leavingRef.current) return; // Prevent double-leave
    leavingRef.current = true;

    try {
      // Use the proper leave function from the hook
      leaveRoom();

      // Redirect to home
      router.push('/');
    } catch (_error) {
      // Fallback: just redirect
      router.push('/');
    }
  };

  // Get current user's name from sessionStorage
  useEffect(() => {
    const userName = sessionStorage.getItem('userName');
    if (userName?.trim()) {
      setCurrentUserName(userName.trim());
    } else {
      // Find current user in participants list to get their assigned guest name
      const currentParticipant = participants.find(
        (p) => p.id === participantId,
      );
      if (currentParticipant?.name) {
        setCurrentUserName(currentParticipant.name);
      }
    }
  }, [participantId, participants]);

  // Helper function to get participant name by ID
  const getParticipantName = (participantId: string): string => {
    const participant = participants.find((p) => p.id === participantId);
    return participant?.name ?? 'Unknown';
  };

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
      <div className='bg-background flex min-h-screen flex-col items-center justify-center'>
        <div className='flex items-center space-x-2'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent'></div>
          <span className='text-foreground text-lg'>Verifying room...</span>
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
    <div className='bg-background flex max-h-screen min-h-screen flex-col overflow-hidden'>
      {/* Header */}
      <header className='bg-card flex-shrink-0 border-b p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-card-foreground text-xl font-semibold'>
              Room: {roomHandle}
            </h1>
            <p className='text-muted-foreground text-sm'>
              {totalParticipants} participant
              {totalParticipants !== 1 ? 's' : ''}
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            {/* Connected Status */}
            <div className='flex items-center space-x-2 text-sm'>
              <div
                className={`h-3 w-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-destructive'
                }`}
              ></div>
              <span className='text-muted-foreground'>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main video area */}
      <main className='flex-1 overflow-hidden p-4'>
        {totalParticipants === 1 ? (
          // Single participant - full screen with waiting message
          <div className='flex h-full items-center justify-center'>
            <div className='w-full max-w-4xl'>
              <div className='bg-muted relative aspect-video w-full overflow-hidden rounded-lg shadow-lg'>
                <Video id={participantId} stream={localStream} />
                <div className='absolute bottom-4 left-4 rounded bg-black/70 px-3 py-1 text-white'>
                  {currentUserName}
                </div>
              </div>
              <div className='mt-6 text-center'>
                <div className='mb-4 text-6xl'>👥</div>
                <h2 className='text-foreground mb-2 text-xl font-medium'>
                  Waiting for others to join
                </h2>
                <p className='text-muted-foreground'>
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
              <div className='bg-muted relative overflow-hidden rounded-lg shadow-lg'>
                <Video id={participantId} stream={localStream} />
                <div className='absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white'>
                  {currentUserName}
                </div>
              </div>

              {/* Remote videos */}
              {remoteStreams
                .slice(0, layout.maxParticipants - 1)
                .map((remoteStream) => (
                  <div
                    key={remoteStream.participantId}
                    className='bg-muted relative overflow-hidden rounded-lg shadow-lg'
                  >
                    <Video
                      id={remoteStream.participantId}
                      stream={remoteStream.stream}
                    />
                    <div className='absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white'>
                      {getParticipantName(remoteStream.participantId)}
                    </div>
                  </div>
                ))}

              {/* Show "+N more" if there are too many participants */}
              {remoteStreams.length > layout.maxParticipants - 1 && (
                <div className='bg-muted flex items-center justify-center rounded-lg shadow-lg'>
                  <div className='text-foreground text-center'>
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

      {/* Bottom Controls */}
      <footer className='bg-card flex-shrink-0 border-t p-4'>
        <div className='flex items-center justify-center'>
          <Button
            onClick={handleLeaveMeeting}
            variant='destructive'
            size='lg'
            className='px-8'
          >
            Leave Meeting
          </Button>
        </div>
      </footer>
    </div>
  );
}
