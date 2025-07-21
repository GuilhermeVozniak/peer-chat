import { useEffect, useRef } from 'react';

export interface VideoProps {
  id: string | number;
  stream: MediaStream | null;
}

export const Video = ({ id, stream }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className='relative h-full w-full bg-gray-900'>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className='h-full w-full object-cover'
          id={`video-${String(id)}`}
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center bg-gray-800'>
          <div className='text-center text-gray-400'>
            <div className='mb-2 text-4xl'>📹</div>
            <p className='text-sm'>Camera Off</p>
          </div>
        </div>
      )}
    </div>
  );
};
