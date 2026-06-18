# Installation Guide

## Docker Production Deployment (Recommended)

1. Clone the repo
2. Copy env: `cp .env.example .env`
3. Edit `.env`:
   - Set strong `APP_SECRET` (min 32 chars)
   - Configure `NEXT_PUBLIC_APP_URL` to your domain e.g. https://video.yourdomain.com
   - Set admin credentials
   - Configure SMTP if you want real password reset emails (otherwise links logged to console)
4. (Optional) Setup SSL in nginx/ssl/ and update nginx.conf
5. `docker compose up -d --build`
6. Access via your domain or http://your-server-ip

## Local Development

1. `npm install`
2. `npx prisma generate && npx prisma db push`
3. `npm run dev`
4. Seed admin if needed by visiting /admin or first login.

## Environment Variables

See .env.example for all options.

## Volumes & Persistence

- `uploads/` : Video files and thumbnails
- `prisma/dev.db` : SQLite database
- Logs in container

## Updating

`docker compose down && docker compose pull && docker compose up -d --build`

## Troubleshooting

- Video not playing: Check nginx headers for Accept-Ranges
- Upload fails: Increase client_max_body_size or check MAX_VIDEO_SIZE_MB
- FFmpeg errors: Ensure ffmpeg installed in container (apk add ffmpeg)
