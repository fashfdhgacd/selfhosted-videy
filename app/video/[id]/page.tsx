import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getVideoUrls } from '@/lib/utils'

export default async function DirectVideoPage({ params }: { params: { id: string } }) {
  const video = await prisma.video.findUnique({ where: { id: params.id } })
  if (!video) notFound()
  const urls = getVideoUrls(video.id, video.filename)
  // For direct, we can either redirect to nginx url or show simple player + download
  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="text-2xl mb-4">Direct Video Access</h1>
      <p className="mb-6 text-slate-400">This is the raw video file served via optimized Nginx. Right-click → Save or use in your own players.</p>
      <a href={urls.directUrl} className="inline-block px-8 py-3 bg-primary-500 rounded-2xl">Download / Stream Direct MP4</a>
      <div className="mt-8 text-xs text-slate-500">URL: {urls.directUrl}</div>
    </div>
  )
}
