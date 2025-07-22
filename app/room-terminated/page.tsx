'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RoomTerminated() {
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
        return 'The room has been closed.';
      default:
        return 'The room session has ended.';
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
        <div className='mb-6'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900'>
            <svg
              className='h-8 w-8 text-yellow-600 dark:text-yellow-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h1 className='text-card-foreground mb-2 text-2xl font-bold'>
            Meeting Ended
          </h1>
          <p className='text-muted-foreground text-sm'>{getReasonMessage()}</p>
        </div>

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
