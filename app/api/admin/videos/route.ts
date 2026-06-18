import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  await requireAdmin()
  const videos = await prisma.video.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100
  })
  return NextResponse.json(videos)
}
