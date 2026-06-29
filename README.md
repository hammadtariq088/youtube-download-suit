# YouTube Downloader SaaS (YDS)

Production-grade YouTube downloader with queue-based architecture, cloud storage, admin dashboard, and full API. Built for scale.

## Architecture

```
Frontend (Vercel)    →    Backend API (Render)    →    Redis Queue (Upstash)
                                                        ↓
                             Worker (Hostinger VPS) →   yt-dlp + FFmpeg
                                                        ↓
                             Cloudflare R2 (Storage) ←──┘
                                                        ↓
                             Neon PostgreSQL ←──────────┘
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
cd backend && pnpm drizzle-kit generate && pnpm drizzle-kit migrate

# Start development
pnpm dev
```

## Services

| Service | Stack | Deploy |
|---------|-------|--------|
| Frontend | React 19 + Vite + TailwindCSS | Vercel |
| Backend API | Express + Drizzle ORM | Render |
| Worker | BullMQ + yt-dlp + FFmpeg | Hostinger VPS |
| Database | PostgreSQL (Neon) | Neon |
| Queue | Redis (BullMQ) | Upstash |
| Storage | Cloudflare R2 | Cloudflare |

## License

MIT
