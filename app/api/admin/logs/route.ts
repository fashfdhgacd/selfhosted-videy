import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, getCurrentUser } from '@/lib/auth'
import { getRecentLogs } from '@/lib/logger'

export async function GET() {
  await requireAdmin()
  const logs = await getRecentLogs(100)
  return NextResponse.json(logs)
}
