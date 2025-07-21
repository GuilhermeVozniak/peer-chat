// webrtc works by creating a peer connection and then adding the local stream to it
// then we add the remote stream to the peer connection
// then we can get the remote stream from the peer connection
// then we can display the remote stream in a video element

import { handleError } from './utils.client';

// WebRTC Configuration with fallback to Google STUN servers
export function getWebRTCConfig(): RTCConfiguration {
  try {
    const envServers = process.env.NEXT_PUBLIC_STUN_SERVERS?.split(',') ?? [];
    const stunServers =
      envServers.length > 0
        ? envServers.map((server) => ({ urls: server.trim() }))
        : [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ];

    return { iceServers: stunServers };
  } catch (e) {
    handleError(e as Error);
    // Fallback to Google STUN servers
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
  }
}

// Enhanced peer connection creation with event handlers
export interface PeerConnectionCallbacks {
  onTrack?: (participantId: string, stream: MediaStream) => void;
  onIceCandidate?: (participantId: string, candidate: RTCIceCandidate) => void;
  onConnectionStateChange?: (
    participantId: string,
    state: RTCPeerConnectionState,
  ) => void;
}

export function createEnhancedPeerConnection(
  participantId: string,
  callbacks: PeerConnectionCallbacks = {},
): RTCPeerConnection {
  const peerConnection = new RTCPeerConnection(getWebRTCConfig());

  // Set up event handlers
  if (callbacks.onTrack) {
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      callbacks.onTrack?.(participantId, remoteStream);
    };
  }

  if (callbacks.onIceCandidate) {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        callbacks.onIceCandidate?.(participantId, event.candidate);
      }
    };
  }

  if (callbacks.onConnectionStateChange) {
    peerConnection.onconnectionstatechange = () => {
      callbacks.onConnectionStateChange?.(
        participantId,
        peerConnection.connectionState,
      );
    };
  }

  return peerConnection;
}

// Add local stream tracks to peer connection
export function addLocalStreamTracks(
  peerConnection: RTCPeerConnection,
  localStream: MediaStream,
): void {
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
}

// Create offer and set as local description
export async function createOfferWithLocalDescription(
  peerConnection: RTCPeerConnection,
): Promise<RTCSessionDescriptionInit | null> {
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  } catch (error) {
    handleError(error as Error);
    return null;
  }
}

// Create answer and set as local description
export async function createAnswerWithLocalDescription(
  peerConnection: RTCPeerConnection,
): Promise<RTCSessionDescriptionInit | null> {
  try {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  } catch (error) {
    handleError(error as Error);
    return null;
  }
}

// Set remote description
export async function setRemoteDescription(
  peerConnection: RTCPeerConnection,
  description: RTCSessionDescriptionInit,
): Promise<boolean> {
  try {
    await peerConnection.setRemoteDescription(description);
    return true;
  } catch (error) {
    handleError(error as Error);
    return false;
  }
}

// Add ICE candidate
export async function addIceCandidate(
  peerConnection: RTCPeerConnection,
  candidate: RTCIceCandidateInit,
): Promise<boolean> {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    return true;
  } catch (error) {
    handleError(error as Error);
    return false;
  }
}

// Clean up peer connection
export function closePeerConnection(peerConnection: RTCPeerConnection): void {
  try {
    peerConnection.close();
  } catch (error) {
    handleError(error as Error);
  }
}
