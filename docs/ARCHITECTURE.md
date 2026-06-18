# Architecture Overview

## Tech Stack
- Frontend: Next.js 14 App Router + React 18 + TypeScript + Tailwind
- Backend: Next.js API Routes / Server Actions + Prisma ORM
- Database: SQLite (easy self-host, file based; can swap to Postgres later)
- Video Processing: FFmpeg (thumbnail extraction, ffprobe metadata)
- Auth: Custom JWT (httpOnly cookies) + bcrypt
- File Storage: Local filesystem (/uploads) served via Nginx
- Reverse Proxy & Static: Nginx (range requests for video streaming, security headers, rate limit)
- Containerization: Docker + Docker Compose

## Key Flows

1. **Upload Flow**:
   - Client: XHR multipart upload to /api/upload with progress events
   - Server: Validate file (type, size), save to disk with cuid filename
   - FFmpeg: Spawn ffprobe for duration, ffmpeg for thumbnail at 5s
   - Prisma: Create Video record, associate tags/folder
   - Response: Video object with all URLs

2. **Watch Flow**:
   - /watch/[id] : Auth optional (public videos), render custom VideoPlayer
   - Player events: onTimeUpdate send watched duration to /api/analytics/view (debounced)
   - On ended or significant watch: increment viewsCount

3. **Embed Flow**:
   - /embed/[id] : Minimal iframe-friendly page with player only, no header/sidebar
   - CORS friendly for embedding

4. **Admin Flow**:
   - Role check in middleware and pages
   - Stats aggregation from View and Video models

## Security Considerations
- All inputs validated with Zod
- Passwords hashed
- JWT signed with strong secret
- Rate limiting on upload and sensitive endpoints (nginx + app level)
- File type whitelist (video/mp4,video/webm,video/ogg)
- No direct file serving from Next for uploads (Nginx handles with caching)
- SQLi prevented by Prisma
- XSS: React auto-escape + sanitize on render

## Scalability Notes (Future)
- For high traffic: Swap SQLite to Postgres, add Redis for rate limit/jobs
- Video transcoding: Add worker service for multiple qualities + HLS/DASH (using ffmpeg)
- CDN: Put Nginx behind Cloudflare or use own caching
- Horizontal scale: Shared storage (NFS/S3 selfhost) or object storage minio

Current design prioritizes simplicity, zero cost, full self-host control.
