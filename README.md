# Peer Chat

🚀 A modern WebRTC learning project - Build real-time peer-to-peer communication from scratch using cutting-edge web technologies.

## Overview

Dive deep into the world of real-time web communication! This hands-on project explores WebRTC (Web Real-Time Communication) technology, teaching you to build lightning-fast peer-to-peer applications. Create seamless text chat, crystal-clear audio/video calls, and powerful screen sharing - all running directly between browsers with zero external media servers.

**Learning Focus**: Understanding WebRTC fundamentals, signaling protocols, peer-to-peer networking, and real-time communication patterns.

> 🎥 **Inspired by**: [WebRTC Tutorial Video](https://www.youtube.com/watch?v=QsH8FL0952k) - Following modern WebRTC implementation patterns and best practices.

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
