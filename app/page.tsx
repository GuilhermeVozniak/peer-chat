'use client';

import { Video } from '@/components/common/Video';
import { handleError } from '@/lib/utils';
import { getVideoStream } from '@/lib/video';
import { useEffect, useState } from 'react';

export default function Home() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // get the local user's video stream
  const handleStart = async (): Promise<void> => {
    const stream = (await getVideoStream()) ?? null;
    setLocalStream(stream);
  };

  useEffect(() => {
    const initializeStream = async () => {
      await handleStart();
    };

    initializeStream().catch(handleError);
  }, []);

  return (
    <main className='m-4 grid grid-cols-2 gap-4 md:grid-cols-2'>
      <Video id={-1} stream={localStream} />

      {/* remote users connections */}
      {Array.from({ length: 1 }, (_, i) => (
        <Video key={i} id={i} stream={localStream} />
      ))}
    </main>
  );
}
