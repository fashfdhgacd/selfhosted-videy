import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { analyticsViewSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoId, duration = 0 } = analyticsViewSchema.parse(body)

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const ua = request.headers.get('user-agent') || ''

    await prisma.view.create({
      data: { videoId, ip, userAgent: ua, watchedDuration: duration }
    })

    // Increment total views count
    await prisma.video.update({
      where: { id: videoId },
      data: { viewsCount: { increment: 1 } }
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to track view' }, { status: 400 })
  }
}
