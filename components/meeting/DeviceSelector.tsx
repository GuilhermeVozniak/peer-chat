'use client';

import { Camera, Mic } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MediaDeviceInfo } from '@/lib/video.client';

interface DeviceSelectorProps {
  devices: MediaDeviceInfo[];
  selectedDevice: string | null;
  onDeviceChange: (deviceId: string) => void;
  type: 'video' | 'audio';
  disabled?: boolean;
}

export function DeviceSelector({
  devices,
  selectedDevice,
  onDeviceChange,
  type,
  disabled = false,
}: DeviceSelectorProps) {
  const Icon = type === 'video' ? Camera : Mic;
  const placeholder = type === 'video' ? 'Select camera' : 'Select microphone';

  if (devices.length === 0) {
    return (
      <div className='text-muted-foreground flex items-center space-x-2'>
        <Icon className='h-4 w-4' />
        <span className='text-sm'>
          No {type === 'video' ? 'cameras' : 'microphones'} found
        </span>
      </div>
    );
  }

  return (
    <div className='flex items-center space-x-2'>
      <Icon className='text-muted-foreground h-4 w-4' />
      <Select
        value={selectedDevice ?? undefined}
        onValueChange={onDeviceChange}
        disabled={disabled}
      >
        <SelectTrigger className='w-[200px]'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
