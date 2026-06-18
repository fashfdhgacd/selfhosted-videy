import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  await requireAdmin()
  const [totalUsers, totalVideos, totalViewsAgg] = await Promise.all([
    prisma.user.count(),
    prisma.video.count(),
    prisma.view.count()
  ])

  // Rough storage calculation
  let storageUsed = '0 MB'
  try {
    const videosDir = path.join(process.cwd(), 'uploads/videos')
    const files = await fs.readdir(videosDir).catch(() => [])
    let total = 0
    for (const f of files) {
      const stat = await fs.stat(path.join(videosDir, f)).catch(() => null)
      if (stat) total += stat.size
    }
    storageUsed = (total / 1024 / 1024).toFixed(1) + ' MB'
  } catch {}

  return NextResponse.json({ totalUsers, totalVideos, totalViews: totalViewsAgg, storageUsed })
}
