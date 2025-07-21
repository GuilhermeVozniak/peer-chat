import { handleError } from './utils.client';

export const getVideoStream = async (): Promise<MediaStream | undefined> => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  } catch (e) {
    handleError(e as Error);
  }
};
