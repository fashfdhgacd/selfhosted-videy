'use client'

import Link from 'next/link'
import { Play, Eye, Calendar, Trash2, Edit2, FolderOpen } from 'lucide-react'
import { formatBytes, formatDuration, getVideoUrls } from '@/lib/utils'
import { useState } from 'react'

interface VideoCardProps {
  video: any
  onDelete?: (id: string) => void
  onEdit?: (video: any) => void
  showActions?: boolean
}

export default function VideoCard({ video, onDelete, onEdit, showActions = true }: VideoCardProps) {
  const [deleting, setDeleting] = useState(false)
  const urls = getVideoUrls(video.id, video.filename)

  const handleDelete = async () => {
    if (!confirm('Delete this video permanently?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: 'DELETE' })
      if (res.ok && onDelete) onDelete(video.id)
    } catch (e) {
      alert('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="video-card bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden group">
      <Link href={`/watch/${video.id}`} className="block relative aspect-video bg-slate-950">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <Play className="text-slate-500" size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <div className="w-14 h-14 rounded-full bg-primary-500/90 flex items-center justify-center">
            <Play className="ml-0.5" size={28} fill="white" />
          </div>
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
            {formatDuration(video.duration)}
          </div>
        )}
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <Link href={`/watch/${video.id}`} className="font-semibold text-white line-clamp-2 hover:text-primary-400 transition flex-1">
            {video.title}
          </Link>
          {showActions && (
            <div className="flex gap-1 opacity-60 group-hover:opacity-100">
              {onEdit && <button onClick={() => onEdit(video)} className="p-1.5 hover:bg-slate-700 rounded"><Edit2 size={15} /></button>}
              {onDelete && <button onClick={handleDelete} disabled={deleting} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded"><Trash2 size={15} /></button>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
          <div className="flex items-center gap-1"><Eye size={13} /> {video.viewsCount || 0}</div>
          <div className="flex items-center gap-1"><Calendar size={13} /> {new Date(video.createdAt).toLocaleDateString()}</div>
          {video.folder && <div className="flex items-center gap-1"><FolderOpen size={13} /> {video.folder.name}</div>}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700 flex gap-2 text-[10px]">
          <a href={urls.watchUrl} target="_blank" className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-center flex-1">Watch</a>
          <a href={urls.embedUrl} target="_blank" className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-center flex-1">Embed</a>
        </div>
      </div>
    </div>
  )
}
