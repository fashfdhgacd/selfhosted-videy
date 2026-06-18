'use client'

import { useState, useEffect } from 'react'
import VideoCard from '@/components/VideoCard'
import VideoPlayer from '@/components/VideoPlayer'
import { Upload, FolderPlus, Key, BarChart3, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface Video { id: string; title: string; filename: string; thumbnail?: string; duration?: number; viewsCount: number; createdAt: string; folder?: { name: string } }
interface Folder { id: string; name: string }

 export default function Dashboard() {
  const [videos, setVideos] = useState<Video[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<any[]>([])
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'videos' | 'upload' | 'folders' | 'apikeys'>('videos')

  const filteredVideos = videos.filter(v => 
    (!selectedFolder || v.folder?.name === selectedFolder) &&
    (v.title.toLowerCase().includes(search.toLowerCase()) || (v as any).originalFilename?.toLowerCase().includes(search.toLowerCase()))
  )

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [vRes, fRes, kRes] = await Promise.all([
      fetch('/api/videos'),
      fetch('/api/folders'),
      fetch('/api/keys')
    ])
    if (vRes.ok) setVideos(await vRes.json())
    if (fRes.ok) setFolders(await fRes.json())
    if (kRes.ok) setApiKeys(await kRes.json())
  }

  // Upload with progress using XHR
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setShowUpload(true)
    const newUploads = Array.from(files).map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      progress: 0,
      status: 'uploading' as const,
      title: file.name.replace(/\.[^/.]+$/, ""),
    }))
    setUploadingFiles(prev => [...prev, ...newUploads])

    for (const upload of newUploads) {
      const formData = new FormData()
      formData.append('video', upload.file)
      formData.append('title', upload.title)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload')

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setUploadingFiles(prev => prev.map(u => u.id === upload.id ? { ...u, progress: percent } : u))
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploadingFiles(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'success', progress: 100 } : u))
          fetchData() // refresh list
          toast.success(`Uploaded ${upload.file.name}`)
        } else {
          setUploadingFiles(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'error' } : u))
          toast.error('Upload failed')
        }
      }
      xhr.onerror = () => {
        setUploadingFiles(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'error' } : u))
        toast.error('Network error during upload')
      }

      xhr.send(formData)
    }
  }

  async function createFolder() {
    const name = prompt('Folder name?')
    if (!name) return
    const res = await fetch('/api/folders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    if (res.ok) {
      toast.success('Folder created')
      fetchData()
    }
  }

  async function generateApiKey() {
    const name = prompt('API Key name (e.g. "CLI Tool")') || 'Default Key'
    const res = await fetch('/api/keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    if (res.ok) {
      toast.success('API Key generated (copy from list)')
      fetchData()
    }
  }

  async function deleteVideo(id: string) {
    setVideos(prev => prev.filter(v => v.id !== id))
    fetchData()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-slate-400">Manage your videos, folders and API access</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActiveTab('upload')} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-2xl text-sm font-medium"><Upload size={18} /> Upload Videos</button>
          <button onClick={createFolder} className="flex items-center gap-2 px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-2xl text-sm"><FolderPlus size={18} /> New Folder</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-800">
        {(['videos', 'upload', 'folders', 'apikeys'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-medium border-b-2 transition ${activeTab === tab ? 'border-primary-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
            {tab === 'videos' && 'My Videos'}
            {tab === 'upload' && 'Bulk Upload'}
            {tab === 'folders' && 'Folders'}
            {tab === 'apikeys' && 'API Keys'}
          </button>
        ))}
      </div>

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos..." className="w-full bg-slate-900 border border-slate-700 pl-11 py-3 rounded-2xl" />
            </div>
            <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)} className="bg-slate-900 border border-slate-700 px-4 rounded-2xl">
              <option value="">All Folders</option>
              {folders.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-700 rounded-3xl">
              <p className="text-slate-400">No videos yet. Upload your first video!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map(video => (
                <VideoCard key={video.id} video={video} onDelete={deleteVideo} onEdit={(v) => alert('Edit coming soon - use API or extend UI')} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Upload Tab with Progress */}
      {activeTab === 'upload' && (
        <div className="max-w-3xl">
          <div 
            className="dropzone border-2 border-dashed border-slate-700 hover:border-primary-500 rounded-3xl p-12 text-center cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
            onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).classList.add('dragover') }}
            onDragLeave={e => (e.currentTarget as HTMLElement).classList.remove('dragover')}
            onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLElement).classList.remove('dragover'); handleFileUpload(e.dataTransfer.files) }}
          >
            <Upload className="mx-auto mb-4 text-primary-400" size={48} />
            <p className="text-xl font-medium">Drop videos here or click to browse</p>
            <p className="text-sm text-slate-500 mt-1">MP4, WebM, MOV up to {process.env.MAX_VIDEO_SIZE_MB || 500}MB each • Bulk supported</p>
            <input id="file-input" type="file" multiple accept="video/*" className="hidden" onChange={e => handleFileUpload(e.target.files)} />
          </div>

          {uploadingFiles.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><BarChart3 size={18} /> Upload Progress</h3>
              {uploadingFiles.map((u, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium truncate pr-4">{u.file.name}</span>
                    <span className={u.status === 'success' ? 'text-emerald-400' : u.status === 'error' ? 'text-red-400' : 'text-primary-400'}>{u.status}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 transition-all" style={{ width: `${u.progress}%` }} />
                  </div>
                  <div className="text-right text-xs text-slate-500 mt-1">{u.progress}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Folders & API Keys simplified tabs */}
      {activeTab === 'folders' && (
        <div className="max-w-xl">
          <button onClick={createFolder} className="mb-6 px-5 py-2 bg-slate-800 rounded-2xl flex items-center gap-2"><FolderPlus size={18}/> Create New Folder</button>
          <div className="space-y-2">{folders.map(f => <div key={f.id} className="bg-slate-900 border border-slate-700 px-5 py-4 rounded-2xl flex justify-between"><span>{f.name}</span><span className="text-slate-500 text-sm">{videos.filter(v => v.folder?.name === f.name).length} videos</span></div>)}</div>
        </div>
      )}

      {activeTab === 'apikeys' && (
        <div className="max-w-2xl">
          <button onClick={generateApiKey} className="mb-6 px-5 py-2.5 bg-primary-500 rounded-2xl flex items-center gap-2 text-sm"><Key size={18} /> Generate New API Key</button>
          <div className="text-xs text-slate-400 mb-3">Use X-API-Key header for API uploads. Keep secret!</div>
          {apiKeys.length === 0 ? <p className="text-slate-500">No API keys yet. Generate one above.</p> : apiKeys.map((k, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700 p-4 rounded-2xl mb-3 font-mono text-sm flex justify-between items-center">
              <div>
                <div className="text-emerald-400">{k.name}</div>
                <div className="text-xs text-slate-500">Created {new Date(k.createdAt).toLocaleDateString()} • Last used: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'never'}</div>
              </div>
              <button onClick={async () => { await fetch(`/api/keys/${k.id}`, {method:'DELETE'}); fetchData() }} className="text-red-400 text-xs">Revoke</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
