import { useState, useEffect, useCallback } from 'react';
import {
  getVideoDevices,
  getAudioDevices,
  type MediaDeviceInfo,
} from '@/lib/video.client';

export interface UseMediaDevicesResult {
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  selectedVideoDevice: string | null;
  selectedAudioDevice: string | null;
  isLoading: boolean;
  error: string | null;
  setSelectedVideoDevice: (deviceId: string) => void;
  setSelectedAudioDevice: (deviceId: string) => void;
  refreshDevices: () => Promise<void>;
}

export function useMediaDevices(): UseMediaDevicesResult {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(
    null,
  );
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [videoDevs, audioDevs] = await Promise.all([
        getVideoDevices(),
        getAudioDevices(),
      ]);

      setVideoDevices(videoDevs);
      setAudioDevices(audioDevs);

      // Set default devices if none selected
      if (!selectedVideoDevice && videoDevs.length > 0) {
        setSelectedVideoDevice(videoDevs[0].deviceId);
      }

      if (!selectedAudioDevice && audioDevs.length > 0) {
        setSelectedAudioDevice(audioDevs[0].deviceId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get devices');
    } finally {
      setIsLoading(false);
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  // Load devices on mount
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    refreshDevices();
  }, [refreshDevices]);

  // Listen for device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      refreshDevices();
    };

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener(
        'devicechange',
        handleDeviceChange,
      );
      return () => {
        navigator.mediaDevices.removeEventListener(
          'devicechange',
          handleDeviceChange,
        );
      };
    }
  }, [refreshDevices]);

  return {
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    isLoading,
    error,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    refreshDevices,
  };
}
