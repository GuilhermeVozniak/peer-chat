# User Guide

Welcome to Peer Chat! This guide will help you get started with our browser-based video calling application.

## What is Peer Chat?

Peer Chat is a simple, privacy-focused video calling application that runs entirely in your web browser. No downloads, no account creation, no personal data storage - just instant video calls with your friends, family, or colleagues.

### Key Features

- 🎥 **HD Video Calling**: Crystal clear video with multiple participants
- 🎤 **High-Quality Audio**: Clear audio with echo cancellation
- 🔧 **Device Control**: Switch between cameras and microphones during calls
- 👤 **Custom Names**: Use your own name or join as a guest
- 🏠 **Instant Rooms**: Create or join rooms with simple room names
- 🔒 **Privacy First**: No data stored, no accounts required
- 📱 **Cross-Platform**: Works on desktop, tablet, and mobile browsers

---

## Getting Started

### System Requirements

- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Internet**: Stable internet connection (broadband recommended)
- **Hardware**: Camera and microphone (built-in or external)
- **Permissions**: Allow camera and microphone access when prompted

### Supported Devices

- **Desktop**: Windows, Mac, Linux computers
- **Mobile**: iPhone, iPad, Android phones and tablets
- **Chromebook**: Chrome OS devices

---

## Creating Your First Room

### Step 1: Open the Application

Navigate to the Peer Chat website in your browser. You'll see the home page with options to create or join a room.

### Step 2: Enter Your Name (Optional)

In the "Your Name" field, you can:
- Enter your preferred display name (up to 30 characters)
- Leave it empty to join as a guest (you'll be assigned "Guest 1", "Guest 2", etc.)

### Step 3: Choose a Room Name

In the "Room Name" field:
- Enter a unique room name (2-50 characters)
- Use letters, numbers, hyphens, and underscores only
- Choose something memorable for easy sharing
- Examples: `family-call`, `team-meeting`, `book-club-2024`

### Step 4: Create the Room

Click the **"Create Room"** button. You'll be redirected to your new meeting room, and others can join using the same room name.

**🔑 As the room creator, you have special privileges:**
- When you leave, the room closes for everyone
- You're identified as the meeting host
- You control the room's lifecycle

---

## Joining an Existing Room

### Step 1: Get the Room Name

The person who created the room should share the room name with you. This could be through:
- Text message or email
- Shared calendar invite
- Verbal communication

### Step 2: Enter Your Information

- Enter your name (optional)
- Enter the exact room name provided to you
- Names are case-sensitive, so type carefully

### Step 3: Join the Room

Click **"Join Room"**. If the room exists, you'll be taken to the meeting. If not, you'll see an error message.

**📝 Note**: You cannot join a room that doesn't exist. Someone must create it first.

---

## In the Meeting Room

### Interface Overview

The meeting room has three main areas:

1. **Header**: Shows room name, participant count, and connection status
2. **Main Area**: Video feeds from all participants
3. **Footer**: Media controls, device settings, and leave button

### Video Layout

#### Single Participant (Waiting Room)
- Your video appears in the center
- "Waiting for others to join" message
- Large, prominent display

#### Multiple Participants
- Automatic grid layout based on participant count
- 2 people: Side-by-side layout
- 3-4 people: 2x2 grid
- 5-6 people: 2x3 grid
- 7+ people: 3x3 grid with "+N more" indicator

#### Participant Labels

Each video shows the participant's name in the bottom-left corner:
- Your video: Shows your chosen name or assigned guest name
- Other videos: Show their names or "Guest X" labels

---

## Media Controls

### Audio Controls

#### Mute/Unmute Button
- **Green microphone icon**: Audio is on (you're transmitting audio)
- **Red microphone with slash**: Audio is muted (you're not transmitting audio)
- Click to toggle between mute/unmute
- **Keyboard shortcut**: Press `Space` to temporarily unmute (if implemented)

#### Audio Device Selection
- **Microphone dropdown**: Select from available microphones
- **Hot-swappable**: Change devices during the call
- **Automatic detection**: New devices appear automatically

### Video Controls

#### Camera On/Off Button
- **Green video icon**: Camera is on (you're transmitting video)
- **Red video icon with slash**: Camera is off (video transmission disabled)
- Click to toggle camera on/off
- When off, shows "Camera off" placeholder to others

#### Video Device Selection
- **Camera dropdown**: Select from available cameras
- **Live switching**: Change cameras without interrupting the call
- **Multiple devices**: Built-in webcam, external cameras, etc.

### Visual Indicators

#### Muted Participants
When someone is muted, you'll see:
- Red microphone icon on their video
- Their audio won't play (obviously)

#### Camera Disabled
When someone's camera is off:
- "Camera off" placeholder instead of video
- Red camera icon indicator

---

## Device Management

### Camera Selection

1. **Access the dropdown**: Click the camera dropdown in the footer
2. **Available options**: All connected cameras will be listed
3. **Switch devices**: Select a different camera from the list
4. **Real-time switching**: Video updates immediately for all participants

**Common camera options**:
- Built-in webcam
- External USB cameras
- Professional cameras (with proper drivers)
- Virtual cameras (OBS, ManyCam, etc.)

### Microphone Selection

1. **Access the dropdown**: Click the microphone dropdown in the footer
2. **Available options**: All connected microphones will be listed
3. **Switch devices**: Select a different microphone
4. **Seamless transition**: Audio switches without disconnecting

**Common microphone options**:
- Built-in computer microphone
- Headset microphones
- External USB microphones
- Bluetooth headphones
- Professional audio interfaces

### Device Tips

- **Plug new devices**: They'll appear in the dropdown automatically
- **Test before important calls**: Switch devices to ensure they work
- **Headphones recommended**: Reduce echo and improve audio quality
- **Close other applications**: Free up camera/microphone resources

---

## Understanding Audio Behavior

### What You Hear

- **Other participants**: You hear their voices when they're unmuted
- **Yourself**: You do NOT hear your own voice (prevents echo/feedback)
- **Muted participants**: Complete silence from muted users

### What Others Hear

- **Your voice**: When your microphone is unmuted
- **Background noise**: Pick up room sounds when unmuted
- **Nothing**: Complete silence when you're muted

### Audio Quality Tips

- **Use headphones**: Prevents audio feedback and echo
- **Mute when not speaking**: Reduces background noise for others
- **Good microphone**: Invest in a quality headset for regular use
- **Quiet environment**: Choose a location with minimal background noise

---

## Participant Management

### Guest Names

If you don't enter a name, you'll be automatically assigned:
- **First guest**: "Guest 1"
- **Second guest**: "Guest 2"
- **And so on**: Sequential numbering

### Name Display

Your name appears:
- On your own video feed
- In the participant list (if implemented)
- To all other participants in the room

### Creator vs. Participants

#### Room Creator (Host)
- Creates the room initially
- When they leave, the room closes for everyone
- Identified as the host

#### Regular Participants
- Join existing rooms
- When they leave, others remain in the room
- Can come and go freely

---

## Leaving a Meeting

### How to Leave

Click the **"Leave Meeting"** button in the bottom-right corner of the footer.

### What Happens When You Leave

#### If You're the Room Creator
1. The room immediately terminates for all participants
2. Everyone is redirected to a "Meeting Ended" page
3. The page explains that the host left
4. Automatic redirect to home page after 30 seconds
5. Option to go to home page immediately

#### If You're a Regular Participant
1. You leave the room normally
2. Other participants continue their meeting
3. You're redirected to the home page
4. Your video disappears from other participants' screens

---

## Troubleshooting

### Connection Issues

#### "Disconnected" Status
- **Check internet**: Ensure stable internet connection
- **Refresh page**: Try reloading the browser page
- **Try different browser**: Switch to Chrome or Firefox
- **Restart browser**: Close and reopen your browser

#### Cannot Connect to Room
- **Check room name**: Verify correct spelling and case
- **Ask room creator**: Confirm the room still exists
- **Try creating new room**: Create a new room if needed

### Audio Problems

#### Cannot Hear Others
- **Check volume**: Ensure computer/device volume is up
- **Check mute status**: Verify you're not muted in system settings
- **Try headphones**: Use headphones to isolate audio issues
- **Check device**: Ensure correct audio output device selected

#### Others Cannot Hear You
- **Check mute button**: Ensure you're not muted in the app
- **Check permissions**: Allow microphone access when prompted
- **Check device**: Verify correct microphone is selected
- **Test microphone**: Use system settings to test microphone

#### Echo or Feedback
- **Use headphones**: Most effective solution for echo
- **Lower volume**: Reduce speaker volume
- **Mute when not speaking**: Helps prevent feedback loops

### Video Problems

#### Camera Not Working
- **Check permissions**: Allow camera access when prompted
- **Check device**: Ensure camera is connected and working
- **Close other apps**: Quit applications using the camera
- **Try different camera**: Switch to another camera if available

#### Poor Video Quality
- **Check internet**: Slow connections reduce video quality
- **Close other applications**: Free up bandwidth and processing power
- **Good lighting**: Ensure adequate lighting on your face
- **Stable position**: Keep camera steady for better quality

#### Video is Frozen
- **Refresh page**: Reload the browser page
- **Check connection**: Verify internet connectivity
- **Restart browser**: Close and reopen browser completely

### Browser Issues

#### Permissions Denied
1. **Click the lock icon** in your browser's address bar
2. **Allow camera and microphone** access
3. **Refresh the page** to apply changes
4. **If still denied**: Check browser settings for camera/microphone permissions

#### Browser Compatibility
- **Recommended**: Chrome, Firefox, Safari, Edge (latest versions)
- **Avoid**: Very old browsers or unsupported browsers
- **Update browser**: Ensure you're using the latest version

---

## Privacy & Security

### What We Collect

- **Nothing stored**: No personal data is saved
- **No accounts**: No registration or login required
- **Temporary data only**: Room information exists only while active

### What We Don't Collect

- **No recording**: Calls are not recorded unless you do it locally
- **No chat logs**: No conversation history stored
- **No personal info**: Names are temporary and not saved
- **No tracking**: No cookies or tracking scripts

### Your Privacy Rights

- **Anonymous use**: Use without providing any personal information
- **Temporary sessions**: Everything is deleted when you leave
- **Local control**: You control your camera and microphone
- **No data sharing**: Nothing is shared with third parties

### Security Best Practices

- **Private room names**: Don't use easily guessable room names for private calls
- **Share carefully**: Only share room names with intended participants
- **Close when done**: Leave the room when your meeting is finished
- **Keep browser updated**: Use the latest browser version for security

---

## Tips for Better Meetings

### Before the Meeting

- **Test your setup**: Check camera and microphone beforehand
- **Good lighting**: Position yourself facing a light source
- **Stable internet**: Use wired connection if possible
- **Quiet location**: Choose a location with minimal background noise

### During the Meeting

- **Mute when not speaking**: Reduces background noise for others
- **Look at camera**: Make eye contact by looking at your camera, not the screen
- **Stay centered**: Keep yourself centered in the camera frame
- **Stable position**: Avoid moving the camera or device frequently

### Best Practices

- **Use headphones**: Improves audio quality and prevents echo
- **Good microphone**: Consider investing in a quality headset
- **Close unnecessary apps**: Free up system resources for better performance
- **Have backup plan**: Know alternative ways to communicate if technical issues arise

---

## Frequently Asked Questions

### General Questions

**Q: Do I need to create an account?**
A: No! Peer Chat works without any registration or login. Just visit the website and start calling.

**Q: Is it free to use?**
A: Yes, Peer Chat is completely free with no hidden costs or premium features.

**Q: How many people can join a room?**
A: While there's no hard limit, performance is best with 2-9 participants for optimal video quality.

**Q: Do I need to download anything?**
A: No downloads required. Everything works directly in your web browser.

### Technical Questions

**Q: Which browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions) work best. Avoid Internet Explorer.

**Q: Can I use it on my phone?**
A: Yes! Peer Chat works on mobile browsers, though desktop provides the best experience.

**Q: Why can't I join a room?**
A: The room might not exist yet, or you might have a typo in the room name. Ask the creator to confirm.

**Q: What happens if my internet disconnects?**
A: You'll be disconnected from the call. Refresh the page and rejoin when your connection is restored.

### Privacy Questions

**Q: Are my calls recorded?**
A: No, we don't record any calls. If you want to record, you'll need to use your own recording software.

**Q: Is my personal information stored?**
A: No personal information is stored. Names are temporary and deleted when you leave.

**Q: Can others join my room without permission?**
A: Anyone with the room name can join. Use unique, hard-to-guess room names for private calls.

### Room Management

**Q: How long do rooms last?**
A: Rooms exist as long as people are in them. Empty rooms are automatically deleted.

**Q: Can I kick someone from my room?**
A: Currently, there's no moderation feature. As the creator, you can end the room for everyone by leaving.

**Q: What happens if the room creator's internet fails?**
A: The room will close automatically, and all participants will be redirected to the termination page.

---

## Getting Help

### Support Resources

- **User Guide**: This document covers most common questions
- **Technical Documentation**: Available for developers and advanced users
- **Community Support**: Check for community forums or support channels

### Reporting Issues

If you encounter problems:
1. **Try basic troubleshooting**: Refresh page, check permissions, restart browser
2. **Note error messages**: Take screenshots if you see error messages
3. **Document steps**: Remember what you were doing when the problem occurred
4. **Report the issue**: Contact support with detailed information

### Feedback

We welcome your feedback to improve Peer Chat:
- **Feature requests**: Suggest new features you'd like to see
- **Bug reports**: Let us know about any issues you encounter
- **User experience**: Share your thoughts on how to make it better

---

Welcome to Peer Chat! We hope you enjoy using our simple, privacy-focused video calling platform. Happy chatting! 🎥✨ 