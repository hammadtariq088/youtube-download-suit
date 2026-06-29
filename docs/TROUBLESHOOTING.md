# Troubleshooting Guide

## Common Issues

### Worker not processing jobs
- **Check Redis**: `redis-cli ping` should return `PONG`
- **Check worker logs**: `pm2 logs yds-worker`
- **Verify Redis URL**: Both backend and worker must connect to the same Redis instance
- **Check queue**: `GET /api/health/queue` should show queue connections

### yt-dlp errors
- **Update**: Run `yt-dlp -U` manually to verify updates work
- **Version**: Check `GET /api/admin/worker/status` for version
- **Cookies**: If videos require authentication, upload cookies via admin dashboard

### FFmpeg conversion fails
- **Installation**: Verify `ffmpeg -version` works on the VPS
- **Format support**: Some formats require specific codecs
- **Disk space**: Ensure `TEMP_DOWNLOAD_DIR` has enough space

### Upload to R2 fails
- **Credentials**: Verify R2 access key and secret are correct
- **Bucket name**: Ensure bucket exists and region is set to `auto`
- **Permissions**: Check R2 API token has write permissions

### Database connection fails
- **Connection string**: Verify `DATABASE_URL` is correct
- **IP whitelist**: Neon may require IP whitelisting
- **SSL**: Ensure `sslmode=require` is in the connection string

### Frontend cannot reach API
- **CORS**: Verify `CORS_ORIGIN` on backend matches frontend URL
- **Proxy**: In development, Vite proxy forwards `/api` to `localhost:4000`
- **VITE_API_URL**: In production, set to the Render backend URL

### JWT authentication fails
- **Secret**: Ensure `JWT_SECRET` is at least 32 characters
- **Expiry**: Default is 24 hours; check `JWT_EXPIRY_SECONDS`
- **Token format**: Use `Authorization: Bearer <token>` header

## Admin Dashboard Access

1. Navigate to `/admin/login`
2. Use the credentials from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars
3. Admin user is auto-created on first login attempt
