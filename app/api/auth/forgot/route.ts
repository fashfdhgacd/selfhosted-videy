import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ success: true })
    }

    // Invalidate old resets
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt }
    })

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
    await sendPasswordResetEmail(email, resetLink)

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
