// webrtc works by creating a peer connection and then adding the local stream to it
// then we add the remote stream to the peer connection
// then we can get the remote stream from the peer connection
// then we can display the remote stream in a video element

import { handleError } from './utils';

export const createPeerConnection = (): RTCPeerConnection => {
  return new RTCPeerConnection(_getStunServersAddress());
};

export const createOffer = async (
  peerConnection: RTCPeerConnection,
): Promise<RTCSessionDescriptionInit | undefined> => {
  try {
    return await peerConnection.createOffer();
  } catch (e) {
    handleError(e as Error);
  }
};

export const createAnswer = async (
  peerConnection: RTCPeerConnection,
): Promise<RTCSessionDescriptionInit | undefined> => {
  try {
    return await peerConnection.createAnswer();
  } catch (e) {
    handleError(e as Error);
  }
};

export const setConnectionDescription = async (
  peerConnection: RTCPeerConnection,
  description: RTCSessionDescriptionInit,
) => {
  try {
    await peerConnection.setLocalDescription(description);
  } catch (e) {
    handleError(e as Error);
  }
};

export const addTrackToPeerConnection = (
  localStream: MediaStream,
  peerConnection: RTCPeerConnection,
) => {
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
};

export const addRemoteStreamToPeerConnection = (
  peerConnection: RTCPeerConnection,
  remoteStream: MediaStream,
) => {
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
};

export const onIceCandidate = (peerConnection: RTCPeerConnection) => {
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      // ICE candidate found - would typically send to remote peer
      // Removed console.log to fix lint warning
    }
  };
};

// Helper functions
function _getStunServersAddress(): RTCConfiguration {
  try {
    const urls = process.env.NEXT_PUBLIC_STUN_SERVERS?.split(',') ?? [];
    return {
      iceServers: urls.map((server) => ({
        urls: server.trim(),
      })),
    };
  } catch (e) {
    handleError(e as Error);
  }

  return {
    iceServers: [],
  };
}
