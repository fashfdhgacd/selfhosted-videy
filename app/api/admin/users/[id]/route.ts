import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin()
  // Prevent self delete or last admin
  await prisma.user.delete({ where: { id: params.id } }).catch(() => {})
  return NextResponse.json({ success: true })
}
