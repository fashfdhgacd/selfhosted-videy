import prisma from './prisma'

export async function createLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, metadata?: any, userId?: string, videoId?: string) {
  try {
    await prisma.log.create({
      data: {
        level,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
        userId,
        videoId,
      },
    })
  } catch (e) {
    console.error('Failed to create log:', e)
  }
}

export async function getRecentLogs(limit = 50) {
  return prisma.log.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } }
  })
}
