import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const video = await prisma.video.findUnique({ where: { id: params.id } })
  if (!video || video.userId !== user.id) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })

  // Delete files
  try {
    const videoPath = path.join(process.cwd(), 'uploads/videos', video.filename)
    await fs.unlink(videoPath).catch(() => {})
    if (video.thumbnail) {
      const thumbPath = path.join(process.cwd(), video.thumbnail.replace('/uploads', 'uploads'))
      await fs.unlink(thumbPath).catch(() => {})
    }
  } catch (e) {}

  await prisma.video.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
