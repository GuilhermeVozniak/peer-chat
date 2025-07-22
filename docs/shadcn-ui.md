# Shadcn/ui Component Library

This document covers the setup and usage of Shadcn/ui components in the peer-chat project.

## What is Shadcn/ui?

Shadcn/ui is a collection of copy-and-paste components built using Radix UI and Tailwind CSS. It provides beautifully designed, accessible, and customizable components that you can copy and paste into your apps.

### Key Features

- **Copy & Paste**: Components are copied into your project, not installed as dependencies
- **Customizable**: Built with Tailwind CSS, fully customizable
- **Accessible**: Built on top of Radix UI primitives
- **TypeScript**: Full TypeScript support
- **Modern**: Uses the latest React patterns and best practices

## Installation & Setup

### Initial Setup

The project is already configured with Shadcn/ui. The initial setup was done with:

```bash
pnpm dlx shadcn@latest init
```

This created the necessary configuration files and folder structure.

### Configuration Files

- `components.json` - Shadcn/ui configuration
- `lib/utils.ts` - Utility functions (including `cn` helper)
- `components/ui/` - Directory for UI components

## Adding Components

### Basic Usage

To add new Shadcn/ui components to the project:

```bash
# Add a single component
pnpm dlx shadcn@latest add button

# Add multiple components
pnpm dlx shadcn@latest add button card dialog

# Add all components (not recommended)
pnpm dlx shadcn@latest add --all
```

### Example: Adding a Button Component

```bash
pnpm dlx shadcn@latest add button
```

This will:
1. Download the button component code
2. Place it in `components/ui/button.tsx`
3. Install any required dependencies
4. Update imports and utilities as needed

### Example Usage in Components

```tsx
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return (
    <div>
      <Button variant="default">Click me</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Cancel</Button>
    </div>
  )
}
```

## Available Components

### Form Components
```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add radio-group
pnpm dlx shadcn@latest add switch
pnpm dlx shadcn@latest add slider
```

### Layout Components
```bash
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add accordion
pnpm dlx shadcn@latest add collapsible
```

### Navigation Components
```bash
pnpm dlx shadcn@latest add navigation-menu
pnpm dlx shadcn@latest add breadcrumb
pnpm dlx shadcn@latest add pagination
```

### Feedback Components
```bash
pnpm dlx shadcn@latest add alert
pnpm dlx shadcn@latest add toast
pnpm dlx shadcn@latest add progress
pnpm dlx shadcn@latest add skeleton
```

### Overlay Components
```bash
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add sheet
pnpm dlx shadcn@latest add popover
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add dropdown-menu
```

### Data Display
```bash
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add avatar
pnpm dlx shadcn@latest add calendar
```

## WebRTC-Specific Component Suggestions

For the peer-chat WebRTC project, consider adding these components:

### Essential Components for Chat Interface
```bash
# Basic UI elements
pnpm dlx shadcn@latest add button input card

# Chat-specific components
pnpm dlx shadcn@latest add avatar badge scroll-area

# Dialogs and overlays
pnpm dlx shadcn@latest add dialog sheet toast

# Form components for user input
pnpm dlx shadcn@latest add form label textarea
```

### Video/Audio Call Interface
```bash
# Controls and feedback
pnpm dlx shadcn@latest add button toggle switch
pnpm dlx shadcn@latest add slider progress
pnpm dlx shadcn@latest add tooltip popover

# Layout components
pnpm dlx shadcn@latest add separator tabs
pnpm dlx shadcn@latest add aspect-ratio
```

## Customization

### Theme Configuration

Shadcn/ui uses CSS variables for theming. Customize colors in `app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }
}
```

### Component Variants

Most components support multiple variants:

```tsx
// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Button sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Creating Custom Variants

Extend component variants using `class-variance-authority`:

```tsx
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        custom: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
```

## Best Practices

### 1. Component Organization
```
components/
├── ui/           # Shadcn/ui components
├── webrtc/       # Custom WebRTC components
├── chat/         # Chat-specific components
└── layout/       # Layout components
```

### 2. Import Patterns
```tsx
// Use absolute imports with @ alias
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/components/chat/chat-message'
```

### 3. Composition over Customization
```tsx
// Good: Compose components
function ChatInput() {
  return (
    <div className="flex gap-2">
      <Input placeholder="Type a message..." />
      <Button>Send</Button>
    </div>
  )
}

// Better: Create reusable composed components
function MessageInput({ onSend, disabled }) {
  return (
    <form onSubmit={onSend} className="flex gap-2">
      <Input 
        placeholder="Type a message..." 
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled}>
        Send
      </Button>
    </form>
  )
}
```

### 4. Accessibility
Shadcn/ui components are built with accessibility in mind, but always test:

```tsx
// Use semantic HTML and ARIA labels
<Button 
  aria-label="Start video call"
  disabled={!isConnected}
>
  <VideoIcon />
</Button>
```

## Integration with WebRTC Project

### Actual Implementation: Peer Chat Components

This section shows the real components we built for the Peer Chat application using Shadcn/ui.

#### Components Actually Used

```bash
# Components we added and use in production
pnpm dlx shadcn@latest add button    # MediaControls, Leave Meeting button
pnpm dlx shadcn@latest add input     # Room name and user name inputs
pnpm dlx shadcn@latest add select    # DeviceSelector dropdowns
```

#### Real Implementation: MediaControls Component

```tsx
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  disabled?: boolean;
}

export function MediaControls({
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  disabled = false,
}: MediaControlsProps) {
  return (
    <div className='flex items-center space-x-2'>
      {/* Audio Toggle */}
      <Button
        onClick={onToggleAudio}
        variant={isAudioEnabled ? 'outline' : 'destructive'}
        size='sm'
        disabled={disabled}
        aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioEnabled ? (
          <Mic className='h-4 w-4' />
        ) : (
          <MicOff className='h-4 w-4' />
        )}
      </Button>

      {/* Video Toggle */}
      <Button
        onClick={onToggleVideo}
        variant={isVideoEnabled ? 'outline' : 'destructive'}
        size='sm'
        disabled={disabled}
        aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? (
          <Video className='h-4 w-4' />
        ) : (
          <VideoOff className='h-4 w-4' />
        )}
      </Button>
    </div>
  );
}
```

#### Real Implementation: DeviceSelector Component

```tsx
import { Camera, Mic } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        <span className='text-sm'>No {type === 'video' ? 'cameras' : 'microphones'} found</span>
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
        <SelectTrigger className='w-48'>
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
```

#### Real Implementation: Meeting Room Layout

```tsx
// How we actually use these components in the meeting room
export default function MeetingRoom() {
  const {
    // ... other WebRTC state
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    switchVideoDevice,
    switchAudioDevice,
    localStream,
    leaveRoom,
  } = useWebRTC(roomHandle);

  return (
    <div className='flex h-screen flex-col'>
      {/* Header and main content */}
      
      {/* Footer with actual controls */}
      <footer className='bg-card flex-shrink-0 border-t p-4'>
        <div className='flex items-center justify-between'>
          {/* Left side controls */}
          <div className='flex items-center space-x-4'>
            {/* Media Controls */}
            <MediaControls
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              onToggleVideo={toggleVideo}
              onToggleAudio={toggleAudio}
              disabled={!localStream}
            />

            {/* Visual Separator */}
            <div className='h-6 w-px bg-border'></div>

            {/* Device Controls */}
            <DeviceSelector
              devices={videoDevices}
              selectedDevice={selectedVideoDevice}
              onDeviceChange={switchVideoDevice}
              type='video'
              disabled={!localStream}
            />
            <DeviceSelector
              devices={audioDevices}
              selectedDevice={selectedAudioDevice}
              onDeviceChange={switchAudioDevice}
              type='audio'
              disabled={!localStream}
            />
          </div>

          {/* Leave Meeting Button */}
          <Button
            onClick={leaveRoom}
            variant='destructive'
            className='ml-4'
          >
            Leave Meeting
          </Button>
        </div>
      </footer>
    </div>
  );
}
```

#### Real Implementation: Form Components

```tsx
// Home page form using Input component
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <form className='space-y-6'>
      {/* Name Input */}
      <div>
        <label htmlFor='name' className='text-card-foreground mb-2 block text-sm font-medium'>
          Your Name (Optional)
        </label>
        <Input 
          id='name' 
          type='text' 
          placeholder='Enter your name' 
          className='w-full transition-colors' 
        />
        <p className='text-muted-foreground mt-1 text-xs'>
          Leave empty to join as a guest
        </p>
      </div>

      {/* Room Handle Input */}
      <div>
        <label htmlFor='roomHandle' className='text-card-foreground mb-2 block text-sm font-medium'>
          Room Name
        </label>
        <Input 
          id='roomHandle' 
          type='text' 
          placeholder='Enter room name' 
          className='w-full transition-colors' 
        />
      </div>

      {/* Action Buttons */}
      <div className='flex gap-4'>
        <Button type='submit' className='flex-1'>
          Create Room
        </Button>
        <Button type='button' variant='outline' className='flex-1'>
          Join Room
        </Button>
      </div>
    </form>
  );
}
```

### Component Usage Summary

#### Production Components Used

1. **Button Component**
   - MediaControls (mute/unmute, camera on/off)
   - Leave Meeting button
   - Create/Join Room buttons
   - Variants: `outline`, `destructive`, `default`

2. **Input Component**
   - User name input (optional)
   - Room name input
   - Form validation integration

3. **Select Component**
   - Camera device selection
   - Microphone device selection
   - Real-time device switching

#### Key Implementation Patterns

1. **Accessibility First**
   ```tsx
   <Button
     aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
     onClick={onToggleAudio}
   >
     {isAudioEnabled ? <Mic /> : <MicOff />}
   </Button>
   ```

2. **Conditional Styling**
   ```tsx
   <Button
     variant={isVideoEnabled ? 'outline' : 'destructive'}
     onClick={onToggleVideo}
   >
     {isVideoEnabled ? <Video /> : <VideoOff />}
   </Button>
   ```

3. **Real-time State Management**
   ```tsx
   <Select
     value={selectedDevice ?? undefined}
     onValueChange={onDeviceChange}
     disabled={!localStream}
   >
   ```

4. **Empty State Handling**
   ```tsx
   {devices.length === 0 ? (
     <div className='text-muted-foreground'>No devices found</div>
   ) : (
     <Select>...</Select>
   )}
   ```

This real implementation demonstrates how Shadcn/ui components integrate seamlessly with WebRTC functionality to create a professional video calling interface.

## Useful Commands

```bash
# List all available components
pnpm dlx shadcn@latest add

# Update Shadcn/ui CLI
pnpm dlx shadcn@latest@latest

# Check component dependencies
pnpm dlx shadcn@latest diff

# Get help
pnpm dlx shadcn@latest --help
```

## Resources

- **[Shadcn/ui Documentation](https://ui.shadcn.com/)** - Official documentation
- **[Component Examples](https://ui.shadcn.com/examples)** - Pre-built page examples
- **[Radix UI Documentation](https://www.radix-ui.com/)** - Underlying primitive components
- **[Class Variance Authority](https://cva.style/)** - Variant management utility
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure the `@` alias is configured in `tsconfig.json`
2. **Styling Issues**: Check Tailwind CSS configuration
3. **TypeScript Errors**: Update component types after adding new components
4. **Missing Dependencies**: Run `pnpm install` after adding components

### Component Not Working?

1. Check if the component was properly installed
2. Verify imports are correct
3. Ensure all dependencies are installed
4. Check for TypeScript errors
5. Validate Tailwind classes are available 