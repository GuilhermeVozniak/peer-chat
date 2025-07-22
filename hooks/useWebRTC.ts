import { getVideoStream, type StreamConstraints } from '@/lib/video.client';
import {
  addIceCandidate,
  addLocalStreamTracks,
  closePeerConnection,
  createAnswerWithLocalDescription,
  createEnhancedPeerConnection,
  createOfferWithLocalDescription,
  setRemoteDescription,
  type PeerConnectionCallbacks,
} from '@/lib/webrtc.client';
import type { Participant } from '@/types/websocket';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseJson } from '../lib/utils';
import { useMediaDevices } from './useMediaDevices';

export interface RemoteStream {
  participantId: string;
  stream: MediaStream;
}

export interface WebRTCState {
  localStream: MediaStream | null;
  remoteStreams: RemoteStream[];
  participants: Participant[];
  isConnected: boolean;
  error: string | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

// Simplified WebSocket message interface for internal use
export interface InternalWebSocketMessage {
  type: string;
  participantId: string;
  roomHandle: string;
  timestamp: number;
  participant?: Participant;
  participants?: Participant[];
  targetParticipantId?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  error?: string;
  reason?: string; // Added for room-terminated message
}

export function useWebRTC(roomHandle: string) {
  const [state, setState] = useState<WebRTCState>({
    localStream: null,
    remoteStreams: [],
    participants: [],
    isConnected: false,
    error: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const participantIdRef = useRef<string>('');
  const localStreamRef = useRef<MediaStream | null>(null);

  // Use media devices hook
  const {
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    isLoading: devicesLoading,
    error: devicesError,
    refreshDevices,
  } = useMediaDevices();

  // Generate unique participant ID
  const generateParticipantId = useCallback(() => {
    return `participant_${Date.now().toString()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Initialize local video stream with device constraints
  const initializeLocalStream = useCallback(async () => {
    try {
      const constraints: StreamConstraints = {
        videoDeviceId: selectedVideoDevice ?? undefined,
        audioDeviceId: selectedAudioDevice ?? undefined,
        video: true,
        audio: true,
      };

      const stream = await getVideoStream(constraints);
      if (stream) {
        // Stop previous stream if exists
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
        }

        localStreamRef.current = stream;
        setState((prev) => ({ ...prev, localStream: stream, error: null }));

        // Update peer connections with new stream
        peerConnectionsRef.current.forEach((peerConnection) => {
          const senders = peerConnection.getSenders();
          stream.getTracks().forEach((track) => {
            const sender = senders.find((s) => s.track?.kind === track.kind);
            if (sender) {
              sender.replaceTrack(track).catch(console.error);
            } else {
              peerConnection.addTrack(track, stream);
            }
          });
        });

        return stream;
      } else {
        throw new Error('Failed to get video stream');
      }
    } catch (error) {
      console.error('Error initializing local stream:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to get video stream',
      }));
      return null;
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  // Switch video device
  const switchVideoDevice = useCallback(
    async (deviceId: string) => {
      setSelectedVideoDevice(deviceId);
      // Re-initialize stream with new device
      await initializeLocalStream();
    },
    [setSelectedVideoDevice, initializeLocalStream],
  );

  // Switch audio device
  const switchAudioDevice = useCallback(
    async (deviceId: string) => {
      setSelectedAudioDevice(deviceId);
      // Re-initialize stream with new device
      await initializeLocalStream();
    },
    [setSelectedAudioDevice, initializeLocalStream],
  );

  // Create peer connection for a specific participant using enhanced utilities
  const createPeerConnection = useCallback(
    (targetParticipantId: string) => {
      if (peerConnectionsRef.current.has(targetParticipantId)) {
        return peerConnectionsRef.current.get(targetParticipantId);
      }

      const callbacks: PeerConnectionCallbacks = {
        onTrack: (participantId: string, remoteStream: MediaStream) => {
          console.log('Received remote stream from:', participantId);
          setState((prev) => ({
            ...prev,
            remoteStreams: [
              ...prev.remoteStreams.filter(
                (rs) => rs.participantId !== participantId,
              ),
              { participantId, stream: remoteStream },
            ],
          }));
        },
        onIceCandidate: (participantId: string, candidate: RTCIceCandidate) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'webrtc-ice-candidate',
                participantId: participantIdRef.current,
                roomHandle,
                timestamp: Date.now(),
                targetParticipantId: participantId,
                candidate: candidate.toJSON(),
              }),
            );
          }
        },
        onConnectionStateChange: (
          participantId: string,
          state: RTCPeerConnectionState,
        ) => {
          console.log(`Peer connection state with ${participantId}:`, state);
          if (state === 'failed' || state === 'disconnected') {
            setState((prev) => ({
              ...prev,
              remoteStreams: prev.remoteStreams.filter(
                (rs) => rs.participantId !== participantId,
              ),
            }));
          }
        },
      };

      const peerConnection = createEnhancedPeerConnection(
        targetParticipantId,
        callbacks,
      );

      // Add local stream tracks using utility
      if (localStreamRef.current) {
        addLocalStreamTracks(peerConnection, localStreamRef.current);
      }

      peerConnectionsRef.current.set(targetParticipantId, peerConnection);
      return peerConnection;
    },
    [roomHandle],
  );

  // Create and send offer to a participant using enhanced utilities
  const createOffer = useCallback(
    async (targetParticipantId: string) => {
      const peerConnection = createPeerConnection(targetParticipantId);
      if (!peerConnection) return;

      const offer = await createOfferWithLocalDescription(peerConnection);
      if (offer && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'webrtc-offer',
            participantId: participantIdRef.current,
            roomHandle,
            timestamp: Date.now(),
            targetParticipantId,
            offer,
          }),
        );
      }
    },
    [roomHandle, createPeerConnection],
  );

  // Handle incoming offer using enhanced utilities
  const handleOffer = useCallback(
    async (fromParticipantId: string, offer: RTCSessionDescriptionInit) => {
      const peerConnection = createPeerConnection(fromParticipantId);
      if (!peerConnection) return;

      const success = await setRemoteDescription(peerConnection, offer);
      if (!success) return;

      const answer = await createAnswerWithLocalDescription(peerConnection);
      if (answer && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'webrtc-answer',
            participantId: participantIdRef.current,
            roomHandle,
            timestamp: Date.now(),
            targetParticipantId: fromParticipantId,
            answer,
          }),
        );
      }
    },
    [roomHandle, createPeerConnection],
  );

  // Handle incoming answer using enhanced utilities
  const handleAnswer = useCallback(
    async (fromParticipantId: string, answer: RTCSessionDescriptionInit) => {
      const peerConnection = peerConnectionsRef.current.get(fromParticipantId);
      if (peerConnection) {
        await setRemoteDescription(peerConnection, answer);
      }
    },
    [],
  );

  // Handle incoming ICE candidate using enhanced utilities
  const handleIceCandidate = useCallback(
    async (fromParticipantId: string, candidate: RTCIceCandidateInit) => {
      const peerConnection = peerConnectionsRef.current.get(fromParticipantId);
      if (peerConnection) {
        await addIceCandidate(peerConnection, candidate);
      }
    },
    [],
  );

  // Initialize WebSocket connection and join room
  const initializeWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    participantIdRef.current = generateParticipantId();

    // Get user name and creator status from sessionStorage
    const userName =
      typeof window !== 'undefined' ? sessionStorage.getItem('userName') : null;
    const isCreator =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('isRoomCreator') === 'true'
        : false;

    // Connect to WebSocket server on port 8080
    const ws = new WebSocket('ws://localhost:8080');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setState((prev) => ({ ...prev, isConnected: true, error: null }));

      // Join the room with optional name and creator status
      const joinMessage: {
        type: 'join-room';
        participantId: string;
        roomHandle: string;
        timestamp: number;
        name?: string;
        isCreator?: boolean;
      } = {
        type: 'join-room',
        participantId: participantIdRef.current,
        roomHandle,
        timestamp: Date.now(),
      };

      // Add name to message if available
      if (userName?.trim()) {
        joinMessage.name = userName.trim();
      }

      // Add creator flag if this user created the room
      if (isCreator) {
        joinMessage.isCreator = true;
      }

      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = async (event) => {
      try {
        const message = parseJson<InternalWebSocketMessage>(
          event.data as string,
        );
        if (message) {
          await handleWebSocketMessage(message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setState((prev) => ({ ...prev, isConnected: false }));
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setState((prev) => ({ ...prev, error: 'WebSocket connection failed' }));
    };
  }, [roomHandle, generateParticipantId]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback(
    async (message: InternalWebSocketMessage) => {
      console.log('Received WebSocket message:', message.type);

      switch (message.type) {
        case 'room-state':
          setState((prev) => ({
            ...prev,
            participants: message.participants ?? [],
          }));
          break;

        case 'participant-joined':
          if (message.participant) {
            const newParticipant = message.participant;
            setState((prev) => ({
              ...prev,
              participants: [...prev.participants, newParticipant],
            }));
            // Create offer for new participant
            await createOffer(newParticipant.id);
          }
          break;

        case 'participant-left':
          setState((prev) => ({
            ...prev,
            participants: prev.participants.filter(
              (p) => p.id !== message.participantId,
            ),
            remoteStreams: prev.remoteStreams.filter(
              (rs) => rs.participantId !== message.participantId,
            ),
          }));
          // Clean up peer connection
          const peerConnection = peerConnectionsRef.current.get(
            message.participantId,
          );
          if (peerConnection) {
            closePeerConnection(peerConnection);
            peerConnectionsRef.current.delete(message.participantId);
          }
          break;

        case 'webrtc-offer':
          if (message.offer) {
            await handleOffer(message.participantId, message.offer);
          }
          break;

        case 'webrtc-answer':
          if (message.answer) {
            await handleAnswer(message.participantId, message.answer);
          }
          break;

        case 'webrtc-ice-candidate':
          if (message.candidate) {
            await handleIceCandidate(message.participantId, message.candidate);
          }
          break;

        case 'error':
          console.error('Server error:', message.error);
          setState((prev) => ({
            ...prev,
            error: message.error ?? 'Unknown server error',
          }));
          break;

        case 'room-terminated':
          console.log('Room was terminated:', message.reason);
          setState((prev) => ({
            ...prev,
            error: 'Room has been terminated',
          }));

          // Close WebSocket connection
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.close();
          }

          // Redirect to termination page with reason
          if (typeof window !== 'undefined') {
            const reason = message.reason ?? 'unknown';
            window.location.href = `/room-terminated?reason=${String(reason)}`;
          }
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    },
    [createOffer, handleOffer, handleAnswer, handleIceCandidate],
  );

  // Leave room function
  const leaveRoom = useCallback(() => {
    try {
      // Send leave message if connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'leave-room',
            participantId: participantIdRef.current,
            roomHandle,
            timestamp: Date.now(),
          }),
        );
      }

      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      // Close all peer connections
      peerConnectionsRef.current.forEach((peerConnection) => {
        closePeerConnection(peerConnection);
      });
      peerConnectionsRef.current.clear();

      console.log('Left room successfully');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [roomHandle]);

  // Initialize everything when component mounts
  useEffect(() => {
    const setup = async () => {
      // First, start the WebSocket server
      try {
        await fetch('/api/socket');
        console.log('WebSocket server initialized');
      } catch (error) {
        console.error('Failed to initialize WebSocket server:', error);
      }

      await initializeLocalStream();
      initializeWebSocket();
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setup();

    // Cleanup on unmount
    return () => {
      leaveRoom();
    };
  }, [roomHandle, initializeLocalStream, initializeWebSocket, leaveRoom]);

  // Toggle video on/off
  const toggleVideo = useCallback(() => {
    setState((prev) => {
      const newVideoEnabled = !prev.isVideoEnabled;

      // Update local stream video track
      if (localStreamRef.current) {
        const videoTracks = localStreamRef.current.getVideoTracks();
        videoTracks.forEach((track) => {
          track.enabled = newVideoEnabled;
        });
      }

      return { ...prev, isVideoEnabled: newVideoEnabled };
    });
  }, []);

  // Toggle audio on/off
  const toggleAudio = useCallback(() => {
    setState((prev) => {
      const newAudioEnabled = !prev.isAudioEnabled;

      // Update local stream audio track
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        audioTracks.forEach((track) => {
          track.enabled = newAudioEnabled;
        });
      }

      return { ...prev, isAudioEnabled: newAudioEnabled };
    });
  }, []);

  return {
    ...state,
    participantId: participantIdRef.current,
    leaveRoom,
    // Device management
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    switchVideoDevice,
    switchAudioDevice,
    devicesLoading,
    devicesError,
    refreshDevices,
    // Media controls
    toggleVideo,
    toggleAudio,
  };
}
