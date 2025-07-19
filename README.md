# Peer Chat

A WebRTC learning project for implementing real-time peer-to-peer communication in web browsers.

## Overview

This project is a hands-on learning implementation of WebRTC (Web Real-Time Communication) technology. It demonstrates how to build real-time communication features like text chat, audio/video calling, and screen sharing directly between web browsers without requiring external servers for media relay.

**Learning Focus**: Understanding WebRTC fundamentals, signaling protocols, peer-to-peer networking, and real-time communication patterns.

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Code Quality**: ESLint + Prettier + Husky
- **WebRTC**: Native browser APIs
- **Signaling**: WebSocket (to be implemented)

## Quick Start

### Prerequisites

- Node.js 18+ (see `.nvmrc`)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/GuilhermeVozniak/peer-chat.git
cd peer-chat

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Commands

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Check code issues
pnpm lint:fix     # Auto-fix issues
pnpm format       # Format code
pnpm type-check   # TypeScript validation
pnpm code-quality # Run all quality checks
```

## Project Status

🚧 **In Development** - This is a learning project focused on WebRTC implementation.

### Current Features

- ✅ Next.js setup with TypeScript
- ✅ Tailwind CSS styling
- ✅ Comprehensive code quality tools
- ⏳ WebRTC peer connection (planned)
- ⏳ Text chat functionality (planned)
- ⏳ Audio/video calling (planned)

## Documentation

- **[Code Quality Setup](./docs/code-quality.md)** - ESLint, Prettier, Husky configuration
- **[WebRTC Learning Guide](./docs/webrtc-learning.md)** - WebRTC concepts and implementation plan

## Contributing

This is primarily a learning project, but contributions and suggestions are welcome! Please ensure your code follows the established quality standards by running `pnpm code-quality` before submitting.

## License

MIT License - feel free to use this project for learning and experimentation.

---

**Note**: This project uses modern web technologies and requires HTTPS for WebRTC functionality in production environments.
