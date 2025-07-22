'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function RoomTerminatedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'unknown';
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [router]);

  const getReasonMessage = () => {
    switch (reason) {
      case 'creator-left':
        return 'The room host has left the meeting.';
      case 'room-closed':
        return 'The meeting room has been closed.';
      default:
        return 'The meeting has ended.';
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <main className='from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-4'>
      {/* Theme Toggle */}
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      <div className='bg-card w-full max-w-md rounded-2xl border p-8 text-center shadow-xl'>
        {/* Icon */}
        <div className='mb-6 flex justify-center'>
          <svg
            className='text-muted-foreground h-16 w-16'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
            />
          </svg>
        </div>

        <h1 className='text-card-foreground mb-2 text-2xl font-bold'>
          Meeting Ended
        </h1>
        <p className='text-muted-foreground text-sm'>{getReasonMessage()}</p>

        <div className='mb-6'>
          <p className='text-muted-foreground mb-2 text-sm'>
            You will be redirected to the home page in:
          </p>
          <div className='text-primary text-4xl font-bold'>{countdown}s</div>
        </div>

        <div className='space-y-3'>
          <Button onClick={handleGoHome} className='w-full' size='lg'>
            Go to Home Now
          </Button>
          <p className='text-muted-foreground text-xs'>
            Thank you for using Peer Chat!
          </p>
        </div>
      </div>
    </main>
  );
}

export default function RoomTerminated() {
  return (
    <Suspense
      fallback={
        <main className='from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-4'>
          <div className='bg-card w-full max-w-md rounded-2xl border p-8 text-center shadow-xl'>
            <div className='text-muted-foreground'>Loading...</div>
          </div>
        </main>
      }
    >
      <RoomTerminatedContent />
    </Suspense>
  );
}
