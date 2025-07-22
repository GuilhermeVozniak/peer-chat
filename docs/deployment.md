# Deployment Guide

This guide covers deploying the Peer Chat application to production environments with various hosting providers and deployment strategies.

## Overview

Peer Chat is a Next.js application with both frontend and backend components:
- **Frontend**: React-based UI served by Next.js
- **Backend**: Next.js API routes + WebSocket server
- **Database**: In-memory storage (can be upgraded to persistent storage)

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed locally
- Git repository with your code
- Environment variables configured
- SSL certificates (HTTPS required for WebRTC)
- Domain name (recommended for production)

---

## Environment Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# WebSocket Configuration
WEBSOCKET_PORT=8080
WEBSOCKET_HOST=0.0.0.0

# Security (optional)
SESSION_SECRET=your-random-secret-key-here
CORS_ORIGIN=https://yourdomain.com

# STUN/TURN Servers (optional)
NEXT_PUBLIC_STUN_SERVERS=stun:stun.l.google.com:19302
NEXT_PUBLIC_TURN_SERVERS=turn:your-turn-server.com:3478
TURN_USERNAME=your-turn-username
TURN_CREDENTIAL=your-turn-password
```

### Production Environment Variables

For production, set these environment variables in your hosting platform:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
WEBSOCKET_PORT=8080
PORT=3000
```

---

## Hosting Options

### 1. Vercel (Recommended for Frontend)

Vercel provides excellent Next.js hosting but doesn't support WebSocket servers.

#### Setup Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy from project directory
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add production environment variables

3. **Custom Domain**
   - Add your domain in Vercel Dashboard → Domains
   - Configure DNS records as instructed

4. **WebSocket Server Limitation**
   - Vercel doesn't support WebSocket servers
   - You'll need a separate server for WebSocket functionality
   - Consider using Railway, Render, or VPS for WebSocket server

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Railway (Full-Stack Deployment)

Railway supports both Next.js and WebSocket servers.

#### Setup Steps

1. **Create Railway Account**
   - Visit [railway.app](https://railway.app)
   - Connect your GitHub account

2. **Deploy from GitHub**
   ```bash
   # Install Railway CLI (optional)
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway deploy
   ```

3. **Configure Environment Variables**
   - In Railway Dashboard → Variables
   - Add all production environment variables

4. **Custom Domain**
   - Railway provides a subdomain
   - Add custom domain in Settings → Domains

#### Railway Configuration

Create `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
numReplicas = 1
sleepApplication = false
restartPolicyType = "always"

[[services]]
name = "web"
source = "."

[services.web]
buildCommand = "npm run build"
startCommand = "npm start"

[[services.web.variables]]
name = "NODE_ENV"
value = "production"
```

### 3. Render

Render provides good support for full-stack applications.

#### Setup Steps

1. **Create Render Account**
   - Visit [render.com](https://render.com)
   - Connect your GitHub repository

2. **Create Web Service**
   - Choose "Web Service" from dashboard
   - Connect your repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Start Command: `npm start`

3. **Environment Variables**
   - Add environment variables in service settings

4. **Custom Domain**
   - Add custom domain in service settings

### 4. DigitalOcean App Platform

DigitalOcean App Platform provides managed deployment.

#### Setup Steps

1. **Create DigitalOcean Account**
   - Visit [digitalocean.com](https://digitalocean.com)
   - Create an App Platform app

2. **App Specification**
   Create `.do/app.yaml`:

```yaml
name: peer-chat
services:
- name: web
  source_dir: /
  github:
    repo: your-username/peer-chat
    branch: main
  run_command: npm start
  build_command: npm run build
  http_port: 3000
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: "production"
  - key: WEBSOCKET_PORT
    value: "8080"
```

### 5. AWS (Advanced)

For enterprise deployments, consider AWS with ECS or Elastic Beanstalk.

#### ECS Deployment

1. **Create Docker Image**
   Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose ports
EXPOSE 3000 8080

# Start application
CMD ["npm", "start"]
```

2. **Deploy to ECS**
   - Build and push Docker image to ECR
   - Create ECS task definition
   - Deploy to ECS cluster

### 6. VPS (Self-Hosted)

For full control, deploy to a Virtual Private Server.

#### Server Setup

1. **Server Requirements**
   - Ubuntu 20.04+ or similar
   - 2+ GB RAM
   - Node.js 18+
   - Nginx (reverse proxy)
   - SSL certificate

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/peer-chat.git
   cd peer-chat
   
   # Install dependencies
   npm ci --only=production
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "peer-chat" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   Create `/etc/nginx/sites-available/peer-chat`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket server
    location /socket {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

5. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/peer-chat /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## SSL/TLS Configuration

WebRTC requires HTTPS in production. Here are SSL setup options:

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare (Recommended)

1. **Add Domain to Cloudflare**
   - Sign up at cloudflare.com
   - Add your domain
   - Update nameservers

2. **Configure SSL**
   - SSL/TLS tab → Overview
   - Set encryption mode to "Full" or "Full (strict)"
   - Enable "Always Use HTTPS"

3. **Benefits**
   - Free SSL certificates
   - DDoS protection
   - CDN and caching
   - WebSocket support

### Custom SSL Certificate

If you have a custom SSL certificate:

```nginx
ssl_certificate /path/to/your/certificate.crt;
ssl_certificate_key /path/to/your/private.key;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

---

## WebSocket Server Deployment

### Separate WebSocket Server

For hosting providers that don't support WebSocket servers, deploy separately:

#### Option 1: Dedicated Server

Deploy only the WebSocket server:

```javascript
// websocket-server.js
const WebSocket = require('ws');
const { RoomManager } = require('./lib/room-manager');

const PORT = process.env.WEBSOCKET_PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

const roomManager = new RoomManager();

wss.on('connection', (ws) => {
  // WebSocket handling logic
});

console.log(`WebSocket server running on port ${PORT}`);
```

Deploy this to Railway, Render, or VPS.

#### Option 2: Socket.IO Alternative

Consider using Socket.IO for better compatibility:

```bash
npm install socket.io socket.io-client
```

#### Option 3: Third-Party WebSocket Services

- **Pusher**: Managed WebSocket service
- **Ably**: Real-time messaging platform
- **AWS API Gateway WebSocket**: Serverless WebSocket

---

## Database Upgrade

For production, consider upgrading from in-memory storage:

### PostgreSQL

```bash
npm install pg @types/pg
```

Update room repository:

```typescript
// lib/room-repository-postgres.ts
import { Pool } from 'pg';

export class PostgresRoomRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async createRoom(room: Room): Promise<void> {
    await this.pool.query(
      'INSERT INTO rooms (handle, created_by, created_at) VALUES ($1, $2, $3)',
      [room.handle, room.createdBy, room.createdAt]
    );
  }

  // Additional methods...
}
```

### Redis

For session storage and caching:

```bash
npm install redis @types/redis
```

```typescript
// lib/redis-client.ts
import Redis from 'redis';

export const redis = Redis.createClient({
  url: process.env.REDIS_URL,
});
```

---

## Performance Optimization

### Caching Strategy

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### CDN Configuration

Use CDN for static assets:

```javascript
// next.config.js
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.yourdomain.com' 
    : '',
};
```

### Image Optimization

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

---

## Monitoring & Analytics

### Application Monitoring

```bash
npm install @sentry/nextjs
```

Configure Sentry:

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Health Checks

Create health check endpoint:

```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

### Logging

```bash
npm install winston
```

Configure logging:

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

---

## Security Considerations

### Rate Limiting

```bash
npm install express-rate-limit
```

```typescript
// middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
```

### CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.CORS_ORIGIN || '*',
          },
        ],
      },
    ];
  },
};
```

### Content Security Policy

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; media-src 'self' blob:; connect-src 'self' wss:",
          },
        ],
      },
    ];
  },
};
```

---

## Scaling Considerations

### Horizontal Scaling

For multiple server instances:

1. **Load Balancer**: Distribute traffic across instances
2. **Session Stickiness**: Ensure WebSocket connections stay with same server
3. **Shared Storage**: Use Redis for shared state
4. **Message Broadcasting**: Use Redis pub/sub for cross-server communication

### Vertical Scaling

Server resource requirements:
- **2+ CPU cores**: Handle concurrent connections
- **4+ GB RAM**: Store room and participant data
- **SSD storage**: Fast I/O operations
- **100+ Mbps network**: Handle video streams

### CDN Integration

```javascript
// next.config.js
module.exports = {
  images: {
    loader: 'cloudinary', // or 'imgix', 'akamai'
    path: 'https://res.cloudinary.com/your-cloud/',
  },
};
```

---

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Application Backup

```bash
# Code backup
git clone --mirror https://github.com/your-username/peer-chat.git

# Environment backup
cp .env.production .env.backup
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] SSL certificate obtained
- [ ] Database migrations completed
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Error monitoring setup
- [ ] Health checks configured
- [ ] Performance testing completed

### Post-Deployment

- [ ] SSL certificate working
- [ ] WebSocket connections working
- [ ] Video/audio functionality tested
- [ ] Error monitoring receiving data
- [ ] Performance metrics baseline established
- [ ] Backup procedures verified
- [ ] Documentation updated

### Testing Production

```bash
# Test HTTP endpoints
curl https://yourdomain.com/api/health

# Test WebSocket connection
wscat -c wss://yourdomain.com/socket

# Test video calling
# Manual testing with multiple devices/browsers
```

---

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm audit
npm update

# Security updates
npm audit fix
```

### Log Rotation

```bash
# Logrotate configuration
sudo nano /etc/logrotate.d/peer-chat
```

```
/path/to/peer-chat/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
}
```

### Database Maintenance

```sql
-- PostgreSQL maintenance
VACUUM ANALYZE;
REINDEX DATABASE peer_chat;
```

---

## Troubleshooting

### Common Issues

#### WebSocket Connection Failed
- Check firewall settings
- Verify SSL certificate
- Test WebSocket endpoint directly

#### Video/Audio Not Working
- Ensure HTTPS is enabled
- Check STUN/TURN server configuration
- Verify media device permissions

#### Performance Issues
- Monitor CPU and memory usage
- Check database query performance
- Analyze network bandwidth

### Debugging Tools

```javascript
// Debug mode
if (process.env.NODE_ENV === 'development') {
  console.log('Debug information:', data);
}

// Performance monitoring
console.time('operation');
// ... operation
console.timeEnd('operation');
```

This deployment guide covers the essential aspects of deploying Peer Chat to production. Choose the hosting option that best fits your needs, budget, and technical requirements. 