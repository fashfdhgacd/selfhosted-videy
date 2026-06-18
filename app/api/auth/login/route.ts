import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'
import { createLog } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    await setAuthCookie(token)

    await createLog('INFO', 'User logged in', { email }, user.id)

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 400 })
  }
}
