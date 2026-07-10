# YouTube Downloader SaaS (YDS)

Production-grade YouTube downloader with queue-based architecture, cloud storage, and admin dashboard. Built for scale using a Turborepo monorepo.

## Architecture

```
                         Frontend (Vercel)
                               |
                               v
                         Backend API (Render)
                        /          |           \
                       v           v            v
                  BullMQ Queue   PostgreSQL    Cloudflare R2
                  (Upstash Redis)  (Neon)
                       |
                       v
               Worker (Hostinger VPS)
               /                  \
              v                    v
          yt-dlp + FFmpeg      Apify API
              \                    /
               v                  v
            Cloudflare R2 -----> Neon DB
```

**Flow:** User enters a YouTube URL in the frontend. The backend validates it, fetches metadata (via yt-dlp with Apify fallback), and enqueues a download job. The worker picks up the job, downloads the video with yt-dlp, converts it with FFmpeg, uploads to Cloudflare R2, and updates the database. The frontend polls for progress and provides a signed download URL on completion.

## Tech Stack

| Layer             | Technology                     | Version                           |
| ----------------- | ------------------------------ | --------------------------------- |
| Monorepo          | Turborepo + pnpm               | turbo ^2.5.2, pnpm 10.15.0        |
| Language          | TypeScript                     | ^5.8.3                            |
| Frontend          | React + Vite                   | React ^19.1.0, Vite ^6.3.5        |
| Styling           | Tailwind CSS + Framer Motion   | ^4.1.6, ^12.10.1                  |
| State             | TanStack React Query + Zustand | ^5.76.1, ^5.0.5                   |
| Routing           | React Router                   | ^7.7.1                            |
| UI                | Radix UI + Lucide icons        | various                           |
| Backend           | Express                        | ^5.1.0                            |
| ORM               | Drizzle ORM                    | ^0.43.1                           |
| Database          | PostgreSQL (Neon)              | --                                |
| Queue             | BullMQ + ioredis               | ^5.55.1, 5.10.1                   |
| Cache             | Redis (Upstash)                | --                                |
| Storage           | Cloudflare R2 (S3-compatible)  | @aws-sdk/client-s3 ^3.808.0       |
| Validation        | Zod                            | ^3.24.5                           |
| Auth              | bcryptjs + jsonwebtoken        | ^3.0.3, ^9.0.2                    |
| Logging           | Pino                           | ^9.6.0                            |
| Download Engine   | yt-dlp + FFmpeg                | --                                |
| Metadata Fallback | Apify API                      | --                                |
| Testing           | Vitest                         | --                                |
| Linting           | ESLint                         | ^9.26.0                           |
| Formatting        | Prettier                       | ^3.5.3                            |
| Containerization  | Docker + docker-compose        | node:22-alpine / node:22-bullseye |

## Prerequisites

- Node.js >= 22.0.0
- pnpm >= 10.0.0
- Docker and docker-compose (optional, for local database/redis)
- yt-dlp and FFmpeg (required for the worker service)

## Quick Start

```bash
# Clone the repository
git clone <repo-url> && cd youtube-download-suit

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)

# Start local database and Redis (optional, if not using hosted services)
docker-compose -f docker/docker-compose.yml up -d postgres redis

# Run database migrations
pnpm migrate:generate
pnpm migrate:migrate

# Start all services in development mode
pnpm dev
```

The frontend runs on `http://localhost:5173` and the backend API on `http://localhost:4000`.

## Project Structure

```
youtube-download-suit/
  backend/          Express API server (@yds/backend)
  frontend/         React SPA (@yds/frontend)
  worker/           BullMQ background worker (@yds/worker)
  shared/           Shared types, constants, enums (@yds/shared)
  docker/           Dockerfiles and docker-compose
  scripts/          Deployment and utility scripts
  turbo.json        Turborepo pipeline configuration
  pnpm-workspace.yaml
  vitest.workspace.ts
```

## Services

| Service        | Stack                               | Deploy              |
| -------------- | ----------------------------------- | ------------------- |
| Frontend       | React 19 + Vite 6 + Tailwind CSS v4 | Vercel              |
| Backend API    | Express 5 + Drizzle ORM + BullMQ    | Render              |
| Worker         | BullMQ + yt-dlp + FFmpeg            | Hostinger VPS (PM2) |
| Database       | PostgreSQL                          | Neon                |
| Queue / Cache  | Redis                               | Upstash             |
| Object Storage | Cloudflare R2                       | Cloudflare          |

## Environment Variables

### Backend

| Variable               | Default               | Description                          |
| ---------------------- | --------------------- | ------------------------------------ |
| `NODE_ENV`             | development           | Environment mode                     |
| `PORT`                 | 4000                  | Server port                          |
| `DATABASE_URL`         | --                    | Neon PostgreSQL connection URL       |
| `REDIS_URL`            | --                    | Upstash Redis connection URL         |
| `R2_ENDPOINT`          | --                    | Cloudflare R2 S3-compatible endpoint |
| `R2_ACCESS_KEY_ID`     | --                    | R2 access key                        |
| `R2_SECRET_ACCESS_KEY` | --                    | R2 secret key                        |
| `R2_BUCKET_NAME`       | --                    | R2 bucket name                       |
| `R2_PUBLIC_URL`        | --                    | R2 public URL (optional)             |
| `R2_SIGNED_URL_EXPIRY` | 600                   | Signed URL TTL in seconds            |
| `JWT_SECRET`           | --                    | JWT signing secret (min 32 chars)    |
| `JWT_EXPIRY_SECONDS`   | 86400                 | JWT token expiry                     |
| `ADMIN_EMAIL`          | --                    | Admin account email                  |
| `ADMIN_PASSWORD`       | --                    | Admin account password (min 8 chars) |
| `CORS_ORIGIN`          | http://localhost:5173 | Allowed CORS origin                  |
| `RATE_LIMIT_WINDOW_MS` | 900000                | Rate limit window (ms)               |
| `RATE_LIMIT_MAX`       | 100                   | Max requests per window              |
| `WORKER_API_KEY`       | --                    | Shared secret between API and worker |

### Worker

| Variable                     | Default            | Description                         |
| ---------------------------- | ------------------ | ----------------------------------- |
| `WORKER_ID`                  | worker-1           | Worker identifier                   |
| `WORKER_CONCURRENCY`         | 3                  | Max concurrent jobs                 |
| `TEMP_DOWNLOAD_DIR`          | /tmp/yds-downloads | Temp directory for downloads        |
| `APIFY_TOKEN`                | --                 | Apify API token (fallback metadata) |
| `APIFY_ACTOR_ID`             | --                 | Apify YouTube scraper actor ID      |
| `METADATA_CACHE_TTL_SECONDS` | 86400              | Metadata cache TTL                  |
| `YT_COOKIES_FILE`            | --                 | Path to Netscape cookies file       |
| `YT_COOKIES_FROM_BROWSER`    | --                 | Browser name for cookie extraction  |

### Frontend (Vite)

| Variable        | Default                   | Description          |
| --------------- | ------------------------- | -------------------- |
| `VITE_API_URL`  | http://localhost:4000/api | Backend API base URL |
| `VITE_SITE_URL` | http://localhost:5173     | Frontend site URL    |

## API Reference

| Method | Endpoint                    | Rate Limit | Description               |
| ------ | --------------------------- | ---------- | ------------------------- |
| GET    | `/api/health`               | General    | Health check (DB + Redis) |
| GET    | `/api/health/worker/status` | General    | Worker status             |
| GET    | `/api/health/version`       | General    | Version info              |
| GET    | `/api/health/queue`         | General    | Queue metrics             |
| POST   | `/api/video/info`           | 100/hr     | Fetch video metadata      |
| POST   | `/api/video/convert`        | 100/hr     | Start download job        |
| GET    | `/api/download/:id`         | 60/min     | Poll download status      |
| GET    | `/api/download/:id/url`     | 60/min     | Get signed download URL   |

### Request/Response Examples

**POST /api/video/info**

```json
{ "url": "https://www.youtube.com/watch?v=..." }
```

**POST /api/video/convert**

```json
{ "url": "https://www.youtube.com/watch?v=...", "format": "mp4" }
```

Format enum: `mp4` | `mp3`

## Docker

Use docker-compose for local development with all dependencies:

```bash
# Start PostgreSQL and Redis
docker-compose -f docker/docker-compose.yml up -d postgres redis

# Build and start all services
docker-compose -f docker/docker-compose.yml up --build

# Stop all services
docker-compose -f docker/docker-compose.yml down
```

Individual Dockerfiles are available in `docker/`:

- `Dockerfile.backend` -- Node 22 Alpine, multi-stage build
- `Dockerfile.worker` -- Node 22 Bullseye (includes FFmpeg and yt-dlp)

## Testing

```bash
# Run all tests across all packages
pnpm test

# Run tests for a specific package
pnpm --filter @yds/worker test
pnpm --filter @yds/backend test
```

Tests use Vitest with the workspace configured in `vitest.workspace.ts`. The frontend uses `jsdom` environment.

## Deployment

### Frontend (Vercel)

Deploy via Vercel CLI or GitHub integration. See `scripts/deploy-frontend.sh`.

### Backend API (Render)

Deploy via Docker or Git integration. See `scripts/deploy-backend.sh`.

### Worker (Hostinger VPS)

Deploy via Docker save/load over SSH or PM2 directly. Process management is configured in `worker/ecosystem.config.js` with PM2 (1GB memory limit, auto-restart).

## License

MIT
