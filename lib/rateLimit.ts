import { NextRequest } from 'next/server'

// Simple in-memory rate limiter (for production use Redis or DB table)
// For multi-instance Docker, consider upgrading to shared store
const ipRequests = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // general

const UPLOAD_WINDOW = 60 * 1000;
const MAX_UPLOADS = 5;

export function checkRateLimit(req: NextRequest, type: 'general' | 'upload' = 'general') {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const key = `${ip}:${type}`
  const limit = type === 'upload' ? MAX_UPLOADS : MAX_REQUESTS
  const window = type === 'upload' ? UPLOAD_WINDOW : WINDOW_MS

  const record = ipRequests.get(key)

  if (!record || now > record.resetTime) {
    ipRequests.set(key, { count: 1, resetTime: now + window })
    return { allowed: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((record.resetTime - now) / 1000) }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count }
}

export function rateLimitResponse(retryAfter: number) {
  return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfter }), {
    status: 429,
    headers: { 'Retry-After': retryAfter.toString() }
  })
}
