# API Documentation

Base URL: https://yourdomain.com/api

## Authentication

Most endpoints require either:
- Session cookie (for browser/dashboard)
- API Key: Header `X-API-Key: your-key` or Bearer token

Generate API keys from Dashboard > API Keys

## Endpoints

### Upload Video (multipart)
`POST /api/upload`
- Form fields: `video` (file), `title` (optional), `description` (optional), `folderId` (optional), `tags` (comma separated optional)
- Returns: { success, video: { id, watchUrl, embedUrl, directUrl, shortUrl, ... } }

### List My Videos
`GET /api/videos?folderId=xxx&q=search`

### Delete Video
`DELETE /api/videos/[id]`

### Get Video Analytics
`GET /api/analytics/video/[id]`

### Track View (called by player)
`POST /api/analytics/view` { videoId, duration }

### Admin: List Users
`GET /api/admin/users` (admin only)

Full details in source code app/api/*

## Rate Limits
Upload: ~5 requests/min per IP (nginx + app)

## Error Codes
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (wrong role or ownership)
- 413: File too large
- 415: Unsupported media type
