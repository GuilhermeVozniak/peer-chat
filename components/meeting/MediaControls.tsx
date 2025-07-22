'use client';

import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface MediaControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  disabled?: boolean;
}

export function MediaControls({
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  disabled = false,
}: MediaControlsProps) {
  return (
    <div className='flex items-center space-x-2'>
      {/* Audio Toggle */}
      <Button
        onClick={onToggleAudio}
        variant={isAudioEnabled ? 'outline' : 'destructive'}
        size='sm'
        disabled={disabled}
        className={`h-10 w-10 p-0 ${
          isAudioEnabled
            ? 'hover:bg-accent'
            : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
        }`}
        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioEnabled ? (
          <Mic className='h-4 w-4' />
        ) : (
          <MicOff className='h-4 w-4' />
        )}
      </Button>

      {/* Video Toggle */}
      <Button
        onClick={onToggleVideo}
        variant={isVideoEnabled ? 'outline' : 'destructive'}
        size='sm'
        disabled={disabled}
        className={`h-10 w-10 p-0 ${
          isVideoEnabled
            ? 'hover:bg-accent'
            : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
        }`}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? (
          <Video className='h-4 w-4' />
        ) : (
          <VideoOff className='h-4 w-4' />
        )}
      </Button>
    </div>
  );
}
