'use client';

import { useEffect, useRef } from 'react';
import { VideoOff, MicOff } from 'lucide-react';

interface VideoProps {
  id: string;
  stream?: MediaStream | null;
  className?: string;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  showControls?: boolean;
  isLocal?: boolean;
}

export function Video({
  id: _id,
  stream,
  className = '',
  isVideoEnabled = true,
  isAudioEnabled = true,
  showControls = false,
  isLocal = false,
}: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Check if video track is actually enabled in the stream
  const hasActiveVideoTrack =
    stream?.getVideoTracks().some((track) => track.enabled) ?? false;
  const hasActiveAudioTrack =
    stream?.getAudioTracks().some((track) => track.enabled) ?? false;

  // Determine if we should show the video or placeholder
  const shouldShowVideo = stream && isVideoEnabled && hasActiveVideoTrack;

  return (
    <div className={`relative h-full w-full ${className}`}>
      {shouldShowVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          // Always mute local video to prevent audio feedback
          // Remote videos should only be muted if their audio is disabled
          muted={isLocal || !isAudioEnabled || !hasActiveAudioTrack}
          className='h-full w-full rounded-lg object-cover'
        />
      ) : (
        // Camera off placeholder
        <div className='flex h-full w-full items-center justify-center rounded-lg bg-gray-800'>
          <div className='flex flex-col items-center space-y-2 text-white'>
            <VideoOff className='h-8 w-8' />
            <span className='text-sm'>Camera off</span>
          </div>
        </div>
      )}

      {/* Status indicators */}
      {showControls && (
        <div className='absolute right-2 bottom-2 flex space-x-1'>
          {(!isAudioEnabled || !hasActiveAudioTrack) && (
            <div
              className='rounded-full bg-red-500 p-1'
              title='Microphone muted'
            >
              <MicOff className='h-3 w-3 text-white' />
            </div>
          )}
          {(!isVideoEnabled || !hasActiveVideoTrack) && (
            <div className='rounded-full bg-red-500 p-1' title='Camera off'>
              <VideoOff className='h-3 w-3 text-white' />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
