import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { folderSchema } from '@/lib/validators'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const folders = await prisma.folder.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(folders)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { name } = folderSchema.parse(await request.json())
    const folder = await prisma.folder.create({ data: { name, userId: user.id } })
    return NextResponse.json(folder)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
