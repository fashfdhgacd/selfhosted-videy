import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import crypto from 'crypto'

function generateKey() { return 'sk_' + crypto.randomBytes(24).toString('hex') }
function hashKey(key: string) { return crypto.createHash('sha256').update(key).digest('hex') }

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const keys = await prisma.apiKey.findMany({ where: { userId: user.id }, select: { id: true, name: true, lastUsedAt: true, createdAt: true } })
  return NextResponse.json(keys)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { name } = await request.json()
    const plainKey = generateKey()
    const keyHash = hashKey(plainKey)
    const apiKey = await prisma.apiKey.create({ data: { name: name || 'API Key', keyHash, userId: user.id } })
    // Return plain key ONLY once
    return NextResponse.json({ success: true, key: plainKey, id: apiKey.id, name: apiKey.name, warning: 'Copy this key now. It will not be shown again.' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
