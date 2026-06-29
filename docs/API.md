# API Documentation

Base URL: `https://your-api.com/api`

## Authentication

### POST /auth/login
```json
// Request
{ "email": "admin@example.com", "password": "your-password" }
// Response
{ "success": true, "data": { "token": "jwt...", "user": { "id": "...", "email": "...", "role": "admin" } } }
```

### POST /auth/verify
Verify current token. Requires `Authorization: Bearer <token>` header.

## Video

### POST /video/info
Get video metadata. Rate limited.
```json
// Request
{ "url": "https://youtube.com/watch?v=..." }
// Response
{
  "success": true,
  "data": {
    "id": "video_id",
    "title": "...",
    "description": "...",
    "thumbnail": "https://i.ytimg.com/...",
    "duration": 300,
    "uploader": "...",
    "views": 1000000,
    "formats": [...],
    "qualities": [...]
  }
}
```

### POST /video/convert
Start a download job. Rate limited.
```json
// Request
{ "url": "https://youtube.com/watch?v=...", "format": "mp4", "quality": "720p" }
// Response
{ "success": true, "data": { "id": "download_id", "status": "pending", "pollUrl": "/api/download/id" } }
```

## Download

### GET /download/:id
Poll download status. Returns progress and status.

### GET /download/:id/url
Get signed download URL (valid for 10 minutes). Only when status is `completed`.

## Admin (requires JWT)

All admin endpoints require `Authorization: Bearer <token>`.

### GET /admin/analytics
Overview stats, daily analytics, top formats/qualities.

### GET /admin/downloads?page=1&limit=20
Paginated download history.

### GET /admin/jobs?page=1&limit=20
Paginated job history.

### GET /admin/errors?page=1&limit=20
Error log entries.

### GET /admin/worker/status
Worker and yt-dlp version info.

### GET /admin/queue
Queue depths for all queues.

### GET /admin/storage
R2 storage usage.

### POST /admin/jobs/:id/retry
Retry a failed job.

### DELETE /admin/jobs/:id
Delete a job.

### POST /admin/queue/:name/clear
Clear a queue.

### POST /admin/ytdlp/update
Trigger yt-dlp update on worker.

### GET /admin/cookies
List cookie profiles.

### POST /admin/cookies
Upload cookie profile.

### DELETE /admin/cookies/:id
Delete cookie profile.

## Health

### GET /health
System health check (DB + Redis).

### GET /health/worker/status
Worker availability.

### GET /health/version
App and Node version.

### GET /health/queue
Queue connection status.
