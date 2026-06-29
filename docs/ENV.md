# Environment Variables

## Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment |
| `PORT` | No | `4000` | Server port |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `REDIS_URL` | **Yes** | — | Redis connection string |
| `R2_ENDPOINT` | **Yes** | — | Cloudflare R2 endpoint |
| `R2_ACCESS_KEY_ID` | **Yes** | — | R2 access key |
| `R2_SECRET_ACCESS_KEY` | **Yes** | — | R2 secret key |
| `R2_BUCKET_NAME` | **Yes** | — | R2 bucket name |
| `R2_PUBLIC_URL` | No | — | R2 public URL |
| `R2_SIGNED_URL_EXPIRY` | No | `600` | Signed URL expiry in seconds |
| `JWT_SECRET` | **Yes** | — | JWT signing secret (min 32 chars) |
| `JWT_EXPIRY_SECONDS` | No | `86400` | JWT token expiry |
| `ADMIN_EMAIL` | **Yes** | — | Admin login email |
| `ADMIN_PASSWORD` | **Yes** | — | Admin login password |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |
| `WORKER_API_KEY` | **Yes** | — | Shared secret with worker |

## Worker (`worker/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment |
| `WORKER_ID` | No | `worker-1` | Worker identifier |
| `WORKER_CONCURRENCY` | No | `3` | Parallel jobs |
| `TEMP_DOWNLOAD_DIR` | No | `/tmp/yds-downloads` | Temp download directory |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `REDIS_URL` | **Yes** | — | Redis connection string |
| `R2_ENDPOINT` | **Yes** | — | Cloudflare R2 endpoint |
| `R2_ACCESS_KEY_ID` | **Yes** | — | R2 access key |
| `R2_SECRET_ACCESS_KEY` | **Yes** | — | R2 secret key |
| `R2_BUCKET_NAME` | **Yes** | — | R2 bucket name |
| `R2_PUBLIC_URL` | No | — | R2 public URL |

## Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `/api` | Backend API URL |
| `VITE_SITE_URL` | No | `http://localhost:5173` | Site URL |
