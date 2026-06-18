import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  await requireAdmin()
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true, _count: { select: { videos: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(users)
}
