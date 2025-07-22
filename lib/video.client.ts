import { handleError } from './utils';

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput';
}

export interface StreamConstraints {
  videoDeviceId?: string;
  audioDeviceId?: string;
  video?: boolean;
  audio?: boolean;
}

export const getVideoStream = async (
  constraints?: StreamConstraints,
): Promise<MediaStream | undefined> => {
  try {
    const videoConstraints = constraints?.videoDeviceId
      ? { deviceId: { exact: constraints.videoDeviceId } }
      : true;

    const audioConstraints = constraints?.audioDeviceId
      ? { deviceId: { exact: constraints.audioDeviceId } }
      : (constraints?.audio ?? false);

    return await navigator.mediaDevices.getUserMedia({
      video: constraints?.video !== false ? videoConstraints : false,
      audio: audioConstraints,
    });
  } catch (e) {
    handleError(e as Error);
  }
};

export const getAvailableDevices = async (): Promise<MediaDeviceInfo[]> => {
  try {
    // Request permission first to get device labels
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices
      .filter(
        (device) =>
          device.kind === 'videoinput' || device.kind === 'audioinput',
      )
      .map((device) => ({
        deviceId: device.deviceId,
        label:
          device.label ||
          `${device.kind === 'videoinput' ? 'Camera' : 'Microphone'} ${device.deviceId.slice(-4)}`,
        kind: device.kind as 'videoinput' | 'audioinput',
      }));
  } catch (e) {
    console.error('Error getting available devices:', e);
    return [];
  }
};

export const getVideoDevices = async (): Promise<MediaDeviceInfo[]> => {
  const devices = await getAvailableDevices();
  return devices.filter((device) => device.kind === 'videoinput');
};

export const getAudioDevices = async (): Promise<MediaDeviceInfo[]> => {
  const devices = await getAvailableDevices();
  return devices.filter((device) => device.kind === 'audioinput');
};
