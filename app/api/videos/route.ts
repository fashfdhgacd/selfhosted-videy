import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')
  const q = searchParams.get('q') || ''

  const videos = await prisma.video.findMany({
    where: {
      userId: user.id,
      ...(folderId ? { folderId } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }, { originalFilename: { contains: q } }] } : {})
    },
    include: { folder: { select: { name: true } }, tags: true },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(videos)
}
