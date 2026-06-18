# Selfhosted Videy

**Self-hosted Video Hosting & Embed Platform** - 100% Free & Open Source alternative to Videy.com

Built with Next.js 14, TypeScript, Tailwind CSS, Prisma, SQLite, FFmpeg, Docker & Nginx.

## Features

- User registration, login, forgot password
- Dashboard with video management, folders, bulk upload with progress
- Automatic thumbnail generation with FFmpeg
- Custom HTML5 video player with PiP, speed control, fullscreen
- Multiple embed & share links (watch, embed, direct, short)
- Admin panel: user/video management, storage stats, logs
- Analytics: views, unique views, watch duration, popular videos
- API for uploads with API keys
- Full Docker Compose deployment
- Security: JWT, rate limiting, input validation, XSS/CSRF/SQLi protection

## Quick Start (Docker - Recommended)

```bash
git clone https://github.com/fashfdhgacd/selfhosted-videy.git
cd selfhosted-videy
cp .env.example .env
# Edit .env with your settings (APP_SECRET, ADMIN_EMAIL etc)
docker compose up -d
```

Then open http://localhost (nginx) or http://localhost:3000

Default admin: admin@example.com / admin123changeimmediately (change immediately!)

## Development

```bash
npm install
npx prisma db push
npm run dev
```

## Documentation

See INSTALLATION.md, API_DOCUMENTATION.md, CONTRIBUTING.md

## License
MIT

## Author
Built as production-ready self-hosted platform.
