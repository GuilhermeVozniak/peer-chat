import { useEffect, useRef } from 'react';

export interface VideoProps {
  id: number;
  stream: MediaStream | null;
}

export const Video = ({ id, stream }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const className = 'bg-accent-foreground w-full h-full object-cover';
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className={className}
      id={`video-${String(id)}`}
      ref={videoRef}
    />
  );
};
