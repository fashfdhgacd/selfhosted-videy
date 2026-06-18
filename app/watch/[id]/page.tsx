import { notFound } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import { getVideoUrls } from '@/lib/utils'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'

interface Props { params: { id: string } }

export default async function WatchPage({ params }: Props) {
  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true } }, folder: true, tags: true }
  })
  if (!video || !video.isPublic) notFound()

  const urls = getVideoUrls(video.id, video.filename)

  // Track initial view (will be enhanced by client player events)
  await prisma.view.create({
    data: { videoId: video.id, ip: 'server', userAgent: 'watch-page' }
  }).catch(() => {})
  await prisma.video.update({ where: { id: video.id }, data: { viewsCount: { increment: 1 } } }).catch(() => {})

  await createLog('INFO', `Video watched: ${video.title}`, { videoId: video.id })

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight mb-1">{video.title}</h1>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>by {video.user?.email?.split('@')[0] || 'Unknown'}</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{video.viewsCount} views</span>
          {video.duration && <span>• {Math.round(video.duration)}s</span>}
        </div>
      </div>

      <VideoPlayer 
        src={urls.directUrl} 
        poster={video.thumbnail || undefined} 
        title={video.title}
        onEnded={async () => {
          // Client side can call analytics but here server already incremented
        }}
      />

      <div className="mt-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {video.description && <p className="text-slate-300 whitespace-pre-wrap">{video.description}</p>}
          {video.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{video.tags.map((t: any) => <span key={t.id} className="text-xs px-3 py-1 bg-slate-800 rounded-full">{t.name}</span>)}</div>}
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-sm space-y-4">
          <h3 className="font-semibold text-lg mb-2">Share & Embed</h3>
          <div className="space-y-3">
            {Object.entries(urls).map(([key, url]) => (
              <div key={key}>
                <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">{key.replace('Url','').toUpperCase()}</div>
                <div className="flex gap-2">
                  <input readOnly value={url} className="flex-1 bg-slate-950 border border-slate-700 text-xs px-3 py-2 rounded-xl font-mono" />
                  <button onClick={() => { navigator.clipboard.writeText(url); alert('Copied!') }} className="px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs">Copy</button>
                </div>
              </div>
            ))}
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">IFRAME EMBED</div>
              <textarea readOnly value={urls.iframeCode} className="w-full h-20 bg-slate-950 border border-slate-700 text-xs p-3 rounded-2xl font-mono" />
              <button onClick={() => { navigator.clipboard.writeText(urls.iframeCode); alert('Embed code copied!') }} className="mt-2 w-full py-2 text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-2xl">Copy Iframe Code</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
