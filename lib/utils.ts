import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Simple cn utility (install clsx tailwind-merge if want, but inline for minimal deps)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function generateShortId(id: string): string {
  return id.substring(0, 8)
}

export function getVideoUrls(videoId: string, filename?: string, appUrl?: string) {
  const base = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return {
    watchUrl: `${base}/watch/${videoId}`,
    embedUrl: `${base}/embed/${videoId}`,
    directUrl: `${base}/uploads/videos/${filename || videoId + '.mp4'}`, // nginx served
    shortUrl: `${base}/v/${videoId}`,
    iframeCode: `<iframe src="${base}/embed/${videoId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`
  }
}
