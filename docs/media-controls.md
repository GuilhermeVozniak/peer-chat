# Media Controls & Device Management

This document covers the comprehensive media control and device management features implemented in the peer-chat application.

## Overview

The application provides professional-grade media controls similar to popular video conferencing platforms like Zoom, Google Meet, and Microsoft Teams. Users can control their audio and video streams, select different devices, and manage their media presence in real-time.

## Features

### 🎥 Video Controls
- **Camera On/Off**: Toggle video transmission to other participants
- **Device Selection**: Switch between multiple cameras during the call
- **Visual Feedback**: Clear indicators when camera is disabled
- **Stream Management**: Real-time video track enabling/disabling

### 🎤 Audio Controls
- **Mute/Unmute**: Toggle audio transmission to other participants
- **Device Selection**: Switch between multiple microphones during the call
- **Feedback Prevention**: Local audio is muted to prevent echo/feedback
- **Stream Management**: Real-time audio track enabling/disabling

### 🔧 Device Management
- **Auto-Detection**: Automatically detects available cameras and microphones
- **Hot-Plugging**: Supports device changes during calls (plug/unplug)
- **Fallback Names**: Provides user-friendly names for unnamed devices
- **Error Handling**: Graceful handling of device access issues

## Implementation Architecture

### Component Structure

```
components/
├── meeting/
│   ├── MediaControls.tsx      # Mute/unmute and camera on/off buttons
│   └── DeviceSelector.tsx     # Device selection dropdowns
├── common/
│   └── Video.tsx              # Enhanced video component with audio handling
└── ui/
    └── select.tsx             # Shadcn select component for dropdowns
```

### Hook Structure

```
hooks/
├── useWebRTC.ts               # Enhanced with media control functions
├── useMediaDevices.ts         # Device enumeration and management
└── useRoomValidation.ts       # Existing room validation
```

### Key Libraries

```
lib/
├── video.client.ts            # Enhanced with device constraints
├── webrtc.client.ts           # WebRTC peer connection management
└── utils.client.ts            # Utility functions
```

## Core Components

### MediaControls Component

Located at `components/meeting/MediaControls.tsx`

```tsx
interface MediaControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  disabled?: boolean;
}
```

**Features:**
- Visual state indicators (enabled/disabled)
- Tooltip descriptions for accessibility
- Icon-based interface (Mic/MicOff, Video/VideoOff)
- Disabled state handling
- Destructive styling for muted/disabled states

### DeviceSelector Component

Located at `components/meeting/DeviceSelector.tsx`

```tsx
interface DeviceSelectorProps {
  devices: MediaDeviceInfo[];
  selectedDevice: string | null;
  onDeviceChange: (deviceId: string) => void;
  type: 'video' | 'audio';
  disabled?: boolean;
}
```

**Features:**
- Dropdown selection for available devices
- Type-specific icons (Camera/Microphone)
- Empty state handling when no devices found
- Loading state support
- Real-time device updates

### Enhanced Video Component

Located at `components/common/Video.tsx`

```tsx
interface VideoProps {
  id: string;
  stream?: MediaStream | null;
  className?: string;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  showControls?: boolean;
  isLocal?: boolean;
}
```

**Key Features:**
- **Audio Feedback Prevention**: Local videos are always muted
- **Visual State Indicators**: Shows camera off/microphone muted states
- **Stream Status Detection**: Checks actual track enabled state
- **Placeholder UI**: Camera off placeholder when video is disabled

## Audio Feedback Prevention

### The Problem

Without proper audio handling, users would hear their own voice through their local video element, creating an echo/feedback loop.

### The Solution

```tsx
// Always mute local video to prevent audio feedback
// Remote videos only muted if audio is disabled
muted={isLocal || !isAudioEnabled || !hasActiveAudioTrack}
```

**Implementation Details:**
1. **Local Video**: Always muted in the HTML video element
2. **Audio Track**: Still transmitted to other participants when enabled
3. **Remote Video**: Only muted when participant's audio is disabled
4. **Track Control**: Actual audio transmission controlled via `track.enabled`

### Audio Flow

```
Local User:
├── Microphone Input → Audio Track → Transmitted to Peers
├── Audio Track Enabled/Disabled → Controls transmission
└── Local Video Element → Always muted (no self-feedback)

Remote Users:
├── Received Audio Track → Video Element → Speakers
├── Video Element Muted → Only when remote audio disabled
└── Audio Playback → Controlled by remote participant's settings
```

## Device Management System

### Device Enumeration

The `useMediaDevices` hook handles device discovery and management:

```typescript
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
```

### Device Selection Flow

1. **Permission Request**: Gets media permission to access device labels
2. **Device Enumeration**: Lists all available video and audio input devices
3. **Default Selection**: Automatically selects first available device
4. **Change Detection**: Listens for device plug/unplug events
5. **Stream Update**: Re-creates media stream with new device constraints

### Stream Constraints

```typescript
export interface StreamConstraints {
  videoDeviceId?: string;
  audioDeviceId?: string;
  video?: boolean;
  audio?: boolean;
}
```

### Device Switching Process

1. **User Selection**: User selects new device from dropdown
2. **Stream Recreation**: Creates new media stream with device constraints
3. **Track Replacement**: Replaces tracks in existing peer connections
4. **UI Update**: Updates video display with new stream
5. **Peer Notification**: Remote peers receive updated stream automatically

## WebRTC Integration

### Enhanced useWebRTC Hook

The hook now includes comprehensive media control functions:

```typescript
return {
  // Existing WebRTC state
  localStream,
  remoteStreams,
  isConnected,
  participants,
  
  // Media control state
  isVideoEnabled,
  isAudioEnabled,
  
  // Device management
  videoDevices,
  audioDevices,
  selectedVideoDevice,
  selectedAudioDevice,
  
  // Control functions
  toggleVideo,
  toggleAudio,
  switchVideoDevice,
  switchAudioDevice,
  
  // Utility functions
  leaveRoom,
  refreshDevices,
};
```

### Track Management

```typescript
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
```

## UI Layout Integration

### Footer Controls Layout

The meeting room footer is organized into three sections:

```tsx
<footer className='bg-card flex-shrink-0 border-t p-4'>
  <div className='flex items-center justify-between'>
    {/* Left side controls */}
    <div className='flex items-center space-x-4'>
      {/* Media Controls */}
      <MediaControls />
      
      {/* Visual Separator */}
      <div className='h-6 w-px bg-border'></div>
      
      {/* Device Controls */}
      <DeviceSelector type='video' />
      <DeviceSelector type='audio' />
    </div>

    {/* Leave Meeting Button */}
    <Button variant='destructive'>Leave Meeting</Button>
  </div>
</footer>
```

### Visual Hierarchy

1. **Primary Controls**: Media toggle buttons (prominent, left side)
2. **Secondary Controls**: Device selectors (separated by divider)
3. **Destructive Action**: Leave meeting button (right side, red)

## Error Handling

### Device Access Errors

```typescript
try {
  const devices = await getAvailableDevices();
  setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
  setAudioDevices(devices.filter(d => d.kind === 'audioinput'));
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to get devices');
  toast.error(`Device error: ${error}`);
}
```

### Stream Creation Errors

```typescript
try {
  const stream = await getVideoStream(constraints);
  if (!stream) {
    throw new Error('Failed to get video stream');
  }
  // Success handling
} catch (error) {
  console.error('Error initializing local stream:', error);
  setState(prev => ({
    ...prev,
    error: error instanceof Error ? error.message : 'Failed to get video stream'
  }));
}
```

### Device Change Handling

```typescript
// Listen for device changes
useEffect(() => {
  const handleDeviceChange = () => {
    refreshDevices();
  };

  if (navigator.mediaDevices?.addEventListener) {
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }
}, [refreshDevices]);
```

## Best Practices

### 1. Always Request Permissions First

```typescript
// Request permission to get device labels
await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
const devices = await navigator.mediaDevices.enumerateDevices();
```

### 2. Provide Fallback Device Names

```typescript
label: device.label || `${device.kind === 'videoinput' ? 'Camera' : 'Microphone'} ${device.deviceId.slice(-4)}`
```

### 3. Handle Track Replacement Gracefully

```typescript
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
```

### 4. Separate Local and Remote Audio Handling

```typescript
// Local: Always muted (prevent feedback)
// Remote: Muted only when their audio is disabled
muted={isLocal || !isAudioEnabled || !hasActiveAudioTrack}
```

### 5. Provide Visual Feedback

```tsx
// Status indicators for disabled states
{(!isAudioEnabled || !hasActiveAudioTrack) && (
  <div className='rounded-full bg-red-500 p-1' title='Microphone muted'>
    <MicOff className='h-3 w-3 text-white' />
  </div>
)}
```

## Testing Guidelines

### Device Testing

1. **Multiple Devices**: Test with multiple cameras/microphones
2. **Device Changes**: Test plugging/unplugging devices during calls
3. **Permission Denied**: Test behavior when media access is denied
4. **No Devices**: Test UI when no cameras/microphones are available

### Audio Testing

1. **Feedback Prevention**: Verify no audio feedback with local video
2. **Remote Audio**: Confirm remote participants' audio plays correctly
3. **Mute States**: Test mute/unmute functionality
4. **Device Switching**: Test switching microphones mid-call

### Cross-Browser Testing

1. **Chrome**: Primary target browser
2. **Firefox**: Test WebRTC compatibility
3. **Safari**: Test webkit-specific behaviors
4. **Edge**: Test Chromium-based Edge

## Performance Considerations

### Stream Management

- Stop previous tracks when switching devices
- Properly dispose of old streams to prevent memory leaks
- Use `replaceTrack()` instead of recreating peer connections

### Device Enumeration

- Cache device list to reduce API calls
- Only refresh when necessary (device change events)
- Debounce device change handlers

### UI Updates

- Use `useCallback` for event handlers to prevent unnecessary re-renders
- Memoize device lists when possible
- Batch state updates when switching devices

## Future Enhancements

### Planned Features

- **Audio Level Indicators**: Visual feedback for speaking participants
- **Video Quality Selection**: Choose resolution/framerate
- **Screen Sharing**: Share desktop/application windows
- **Virtual Backgrounds**: Background blur/replacement
- **Recording**: Local/cloud recording capabilities

### Technical Improvements

- **Adaptive Bitrate**: Adjust quality based on network conditions
- **Echo Cancellation**: Advanced audio processing
- **Noise Suppression**: Filter background noise
- **Bandwidth Monitoring**: Real-time connection quality feedback 