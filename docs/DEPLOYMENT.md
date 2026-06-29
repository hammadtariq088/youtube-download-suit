# Deployment Guide

## Frontend → Vercel

1. Push code to GitHub
2. Connect repository in Vercel dashboard
3. Set:
   - Framework: Vite
   - Root directory: `frontend`
   - Build command: `pnpm build`
   - Output: `dist`
4. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://yds-api.onrender.com/api`)
5. Deploy

## Backend → Render

### Option A: Docker (Recommended)
1. Create a Render Web Service
2. Connect repository
3. Set:
   - Runtime: Docker
   - Dockerfile path: `docker/Dockerfile.backend`
4. Add environment variables from `.env.example`
5. Deploy

### Option B: Git-based
1. Create a Render Web Service
2. Set:
   - Build command: `pnpm install && pnpm --filter @yds/backend build`
   - Start command: `node backend/dist/index.js`
3. Add environment variables
4. Deploy

## Worker → Hostinger VPS

### Prerequisites
```bash
# On VPS
apt update && apt install -y nodejs npm ffmpeg python3 python3-pip
pip3 install yt-dlp
corepack enable && corepack prepare pnpm@latest --activate
npm install -g pm2
```

### Deploy
```bash
# Clone on VPS
git clone https://github.com/your-org/youtube-download-suit.git
cd youtube-download-suit

# Install and build
pnpm install
pnpm --filter @yds/worker build

# Set up env
cp .env.example .env
nano .env  # Edit with production values

# Start with PM2
pm2 start worker/ecosystem.config.js
pm2 save
pm2 startup
```

## Redis → Upstash

1. Create account at upstash.com
2. Create a Redis database
3. Copy the `REDIS_URL` connection string
4. Add to backend and worker environment variables

## Database → Neon PostgreSQL

1. Create account at neon.tech
2. Create a PostgreSQL database
3. Copy the `DATABASE_URL` connection string
4. Run migrations:
   ```bash
   DATABASE_URL="postgresql://..." pnpm migrate:migrate
   ```
5. Add to backend and worker environment variables

## Storage → Cloudflare R2

1. Create account at cloudflare.com
2. Create an R2 bucket
3. Generate API tokens (read + write)
4. Add to environment variables:
   - `R2_ENDPOINT`: `https://<accountid>.r2.cloudflarestorage.com`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL` (optional)

## Environment Variables Required

See `docs/ENV.md` for a complete list.
