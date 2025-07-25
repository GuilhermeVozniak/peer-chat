'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useRoomValidation } from '@/hooks/useRoomValidation';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createRoomAction, joinRoomAction } from './actions/room';

// Form validation schema
const roomFormSchema = z.object({
  roomHandle: z
    .string()
    .min(2, 'Room handle must be at least 2 characters')
    .max(50, 'Room handle must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      'Room handle can only contain letters, numbers, hyphens, and underscores',
    ),
  name: z
    .string()
    .max(30, 'Name must be less than 30 characters')
    .optional()
    .or(z.literal('')),
});

type RoomFormData = z.infer<typeof roomFormSchema>;

export default function Home() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    clearErrors,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    mode: 'onChange',
  });

  const roomHandle = watch('roomHandle', '');
  const validation = useRoomValidation(roomHandle, 500);

  // Handle validation results
  React.useEffect(() => {
    if (validation.error && validation.isValid === false) {
      clearErrors('roomHandle');
    }
  }, [validation, clearErrors]);

  const handleCreateRoom = (data: RoomFormData) => {
    startTransition(async () => {
      try {
        // Store user name in sessionStorage if provided
        if (data.name?.trim()) {
          sessionStorage.setItem('userName', data.name.trim());
        } else {
          sessionStorage.removeItem('userName');
        }

        // Mark user as room creator
        sessionStorage.setItem('isRoomCreator', 'true');

        await createRoomAction(data.roomHandle, data.name);
      } catch (error) {
        if (
          error instanceof Error &&
          !error.message.includes('NEXT_REDIRECT')
        ) {
          toast.error(error.message || 'Failed to create room');
        }
      }
    });
  };

  const handleJoinRoom = (data: RoomFormData) => {
    startTransition(async () => {
      try {
        // Store user name in sessionStorage if provided
        if (data.name?.trim()) {
          sessionStorage.setItem('userName', data.name.trim());
        } else {
          sessionStorage.removeItem('userName');
        }

        // Clear any creator flag since this is joining
        sessionStorage.removeItem('isRoomCreator');

        await joinRoomAction(data.roomHandle, data.name);
      } catch (error) {
        if (
          error instanceof Error &&
          !error.message.includes('NEXT_REDIRECT')
        ) {
          toast.error(error.message || 'Failed to join room');
        }
      }
    });
  };

  const getInputState = () => {
    if (errors.roomHandle) return 'error';
    if (validation.isLoading) return 'loading';
    if (validation.isValid === true) return 'success';
    if (validation.isValid === false) return 'error';
    return 'default';
  };

  const getInputMessage = () => {
    if (errors.roomHandle) return errors.roomHandle.message;
    if (validation.isLoading) return 'Checking room availability...';
    if (validation.isValid === true) return 'Room exists and available to join';
    if (validation.isValid === false)
      return 'Room does not exist - you can create it';
    return 'Use letters, numbers, hyphens, and underscores only';
  };

  const getInputClassName = () => {
    const state = getInputState();
    const baseClass = 'w-full transition-colors';

    switch (state) {
      case 'error':
        return `${baseClass} border-destructive focus-visible:ring-destructive`;
      case 'success':
        return `${baseClass} border-green-500 focus-visible:ring-green-500 dark:border-green-400 dark:focus-visible:ring-green-400`;
      case 'loading':
        return `${baseClass} border-blue-500 focus-visible:ring-blue-500 dark:border-blue-400 dark:focus-visible:ring-blue-400`;
      default:
        return baseClass;
    }
  };

  // Determine button visibility
  const hasInput = roomHandle.trim().length > 0;
  const showCreateButton =
    !hasInput || validation.isValid === false || validation.isValid === null;
  const showJoinButton =
    !hasInput || validation.isValid === true || validation.isValid === null;

  // Button state logic
  const isCreateDisabled = !isValid || isPending || !hasInput;
  const isJoinDisabled =
    !isValid || isPending || !hasInput || validation.isValid !== true;

  return (
    <main className='from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-4'>
      {/* Theme Toggle */}
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      <div className='bg-card w-full max-w-md rounded-2xl border p-8 shadow-xl'>
        <div className='mb-8 text-center'>
          <h1 className='text-card-foreground mb-2 text-3xl font-bold'>
            Peer Chat
          </h1>
          <p className='text-muted-foreground'>
            Create or join a video meeting room
          </p>
        </div>

        <form className='space-y-6'>
          <div>
            <label
              htmlFor='name'
              className='text-card-foreground mb-2 block text-sm font-medium'
            >
              Your Name (Optional)
            </label>
            <Input
              id='name'
              {...register('name')}
              type='text'
              placeholder='Enter your name'
              className='w-full transition-colors'
              disabled={isPending}
            />
            {errors.name && (
              <p className='text-destructive mt-1 text-xs'>
                {errors.name.message}
              </p>
            )}
            <p className='text-muted-foreground mt-1 text-xs'>
              Leave empty to join as a guest
            </p>
          </div>

          <div>
            <label
              htmlFor='roomHandle'
              className='text-card-foreground mb-2 block text-sm font-medium'
            >
              Room Handle
            </label>
            <div className='relative'>
              <Input
                id='roomHandle'
                {...register('roomHandle')}
                type='text'
                placeholder='Enter room name (e.g., my-meeting)'
                className={getInputClassName()}
                disabled={isPending}
              />
              {validation.isLoading && (
                <div className='absolute top-1/2 right-3 -translate-y-1/2 transform'>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent dark:border-blue-400'></div>
                </div>
              )}
            </div>
            <p
              className={`mt-1 text-xs ${
                getInputState() === 'error'
                  ? 'text-destructive'
                  : getInputState() === 'success'
                    ? 'text-green-600 dark:text-green-400'
                    : getInputState() === 'loading'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-muted-foreground'
              }`}
            >
              {getInputMessage()}
            </p>
          </div>

          <div className='space-y-3'>
            {/* Create Room Button */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showCreateButton
                  ? 'max-h-20 translate-y-0 transform opacity-100'
                  : 'max-h-0 -translate-y-2 transform opacity-0'
              }`}
            >
              <Button
                type='button'
                onClick={handleSubmit(handleCreateRoom)}
                className='w-full'
                size='lg'
                disabled={isCreateDisabled}
              >
                {isPending ? 'Creating...' : 'Create New Room'}
              </Button>
            </div>

            {/* Join Room Button */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showJoinButton
                  ? 'max-h-20 translate-y-0 transform opacity-100'
                  : 'max-h-0 -translate-y-2 transform opacity-0'
              }`}
            >
              <Button
                type='button'
                onClick={handleSubmit(handleJoinRoom)}
                variant='outline'
                className='w-full'
                size='lg'
                disabled={isJoinDisabled}
              >
                {isPending ? 'Joining...' : 'Join Existing Room'}
              </Button>
            </div>

            {/* Placeholder to maintain consistent height when buttons are hidden */}
            {!hasInput && (
              <div className='text-muted-foreground py-4 text-center text-sm'>
                Start typing to see available actions
              </div>
            )}
          </div>
        </form>

        <div className='text-muted-foreground mt-6 text-center text-xs'>
          <p>
            Creating a room will make you the host. Joining will connect you to
            an existing room.
          </p>
        </div>
      </div>
    </main>
  );
}
