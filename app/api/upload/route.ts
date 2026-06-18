import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { saveVideoFile, generateThumbnail, getVideoDuration } from '@/lib/ffmpeg'
import { getCurrentUser } from '@/lib/auth'
import { videoUploadSchema } from '@/lib/validators'
import { createLog } from '@/lib/logger'
import crypto from 'crypto'

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null

    // Try session cookie first
    const user = await getCurrentUser()
    if (user) {
      userId = user.id
    } else {
      // Try API Key
      const apiKeyHeader = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
      if (apiKeyHeader) {
        const keyRecord = await prisma.apiKey.findFirst({ where: { keyHash: hashApiKey(apiKeyHeader) } })
        if (keyRecord) {
          userId = keyRecord.userId
          await prisma.apiKey.update({ where: { id: keyRecord.id }, data: { lastUsedAt: new Date() } })
        }
      }
    }

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('video') as File | null
    if (!file) return NextResponse.json({ error: 'No video file provided' }, { status: 400 })

    if (!file.type.startsWith('video/')) return NextResponse.json({ error: 'Only video files allowed' }, { status: 415 })
    const maxSize = parseInt(process.env.MAX_VIDEO_SIZE_MB || '500') * 1024 * 1024
    if (file.size > maxSize) return NextResponse.json({ error: `File too large (max ${process.env.MAX_VIDEO_SIZE_MB}MB)` }, { status: 413 })

    const title = (formData.get('title') as string) || file.name.replace(/\.[^/.]+$/, "")
    const description = formData.get('description') as string || null
    const folderId = formData.get('folderId') as string || null
    const tagsStr = formData.get('tags') as string || ''

    const videoId = crypto.randomUUID()
    const saved = await saveVideoFile(file, videoId)

    const [thumbnailPath, duration] = await Promise.all([
      generateThumbnail(saved.path, videoId).catch(() => null),
      getVideoDuration(saved.path)
    ])

    const tagNames = tagsStr.split(',').map(t => t.trim()).filter(Boolean)
    const tagConnections: { id: string }[] = []
    for (const name of tagNames) {
      let tag = await prisma.tag.findUnique({ where: { name } })
      if (!tag) tag = await prisma.tag.create({ data: { name } })
      tagConnections.push({ id: tag.id })
    }

    const video = await prisma.video.create({
      data: {
        id: videoId,
        title: title.substring(0, 200),
        description,
        filename: saved.filename,
        originalFilename: file.name,
        size: saved.size,
        duration: duration || null,
        mimeType: file.type,
        thumbnail: thumbnailPath,
        folderId: folderId || null,
        userId,
        tags: tagConnections.length ? { connect: tagConnections } : undefined,
      },
      include: { folder: true, tags: true }
    })

    await createLog('INFO', `Video uploaded: ${title}`, { size: saved.size, videoId }, userId)

    const { getVideoUrls } = await import('@/lib/utils')
    const urls = getVideoUrls(video.id, video.filename)

    return NextResponse.json({ success: true, video: { ...video, ...urls } })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
