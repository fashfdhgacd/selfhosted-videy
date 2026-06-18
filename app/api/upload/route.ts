import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { saveVideoFile, generateThumbnail, getVideoDuration } from '@/lib/ffmpeg'
import { getCurrentUser } from '@/lib/auth'
import { videoUploadSchema } from '@/lib/validators'
import { createLog } from '@/lib/logger'
import { z } from 'zod'
import crypto from 'crypto'

// Support API key auth too
export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null

    // Try session cookie first
    const user = await getCurrentUser()
    if (user) {
      userId = user.id
    } else {
      // Try API Key
      const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
      if (apiKey) {
        const keyRecord = await prisma.apiKey.findFirst({ where: { keyHash: hashApiKey(apiKey) } })
        if (keyRecord) {
          userId = keyRecord.userId
          // update last used
          await prisma.apiKey.update({ where: { id: keyRecord.id }, data: { lastUsedAt: new Date() } })
        }
      }
    }

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('video') as File | null
    if (!file) return NextResponse.json({ error: 'No video file provided' }, { status: 400 })

    // Validation
    if (!file.type.startsWith('video/')) return NextResponse.json({ error: 'Only video files allowed' }, { status: 415 })
    const maxSize = parseInt(process.env.MAX_VIDEO_SIZE_MB || '500') * 1024 * 1024
    if (file.size > maxSize) return NextResponse.json({ error: `File too large (max ${process.env.MAX_VIDEO_SIZE_MB}MB)` }, { status: 413 })

    const title = formData.get('title') as string || file.name.replace(/\.[^/.]+$/, "")
    const description = formData.get('description') as string || null
    const folderId = formData.get('folderId') as string || null
    const tagsStr = formData.get('tags') as string || ''

    // Save file
    const videoId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
    const saved = await saveVideoFile(file, videoId)

    // Process with FFmpeg
    const [thumbnailPath, duration] = await Promise.all([
      generateThumbnail(saved.path, videoId).catch(() => null),
      getVideoDuration(saved.path)
    ])

    // Handle tags
    const tagNames = tagsStr.split(',').map(t => t.trim()).filter(Boolean)
    const tagConnections = []
    for (const name of tagNames) {
      let tag = await prisma.tag.findUnique({ where: { name } })
      if (!tag) tag = await prisma.tag.create({ data: { name } })
      tagConnections.push({ id: tag.id })
    }

    // Create video record
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

function hashApiKey(key: string): string {
  return require('crypto').createHash('sha256').update(key).digest('hex')
}
