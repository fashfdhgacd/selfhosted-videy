import { notFound } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import prisma from '@/lib/prisma'
import { getVideoUrls } from '@/lib/utils'

interface Props { params: { id: string } }

export default async function EmbedPage({ params }: Props) {
  const video = await prisma.video.findUnique({ where: { id: params.id } })
  if (!video || !video.isPublic) notFound()

  const urls = getVideoUrls(video.id, video.filename)

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[900px]">
        <VideoPlayer src={urls.directUrl} poster={video.thumbnail || undefined} title={video.title} autoPlay={false} />
        <div className="text-center mt-3 text-xs text-slate-500">Hosted on Selfhosted Videy • <a href={urls.watchUrl} target="_blank" className="underline">Watch full page</a></div>
      </div>
    </div>
  )
}
