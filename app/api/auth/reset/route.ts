import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()
    if (!token || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const reset = await prisma.passwordReset.findUnique({ where: { token }, include: { user: true } })
    if (!reset || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } })
    await prisma.passwordReset.delete({ where: { id: reset.id } })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
  }
}
