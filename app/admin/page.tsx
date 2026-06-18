'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Stats { totalUsers: number; totalVideos: number; totalViews: number; storageUsed: string }
interface User { id: string; email: string; role: string; createdAt: string; _count?: { videos: number } }
interface VideoAdmin { id: string; title: string; user: { email: string }; viewsCount: number; size: number; createdAt: string }
interface Log { id: string; level: string; message: string; createdAt: string; user?: { email: string } }

export default function AdminPanel() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [videos, setVideos] = useState<VideoAdmin[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [active, setActive] = useState<'overview' | 'users' | 'videos' | 'logs'>('overview')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [s, u, v, l] = await Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/videos').then(r => r.json()),
      fetch('/api/admin/logs').then(r => r.json())
    ])
    setStats(s)
    setUsers(u)
    setVideos(v)
    setLogs(l)
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete user and all their videos?')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    loadAll()
    toast.success('User deleted')
  }

  async function deleteVideoAdmin(id: string) {
    if (!confirm('Delete video?')) return
    await fetch(`/api/videos/${id}`, { method: 'DELETE' })
    loadAll()
    toast.success('Video deleted')
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-semibold tracking-tight">Admin Panel</h1>
        <div className="text-sm px-4 py-1.5 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/30">Admin Access</div>
      </div>

      <div className="flex gap-2 mb-8">
        {(['overview','users','videos','logs'] as const).map(t => <button key={t} onClick={() => setActive(t)} className={`px-6 py-2 rounded-2xl text-sm ${active===t ? 'bg-slate-800' : 'hover:bg-slate-900'}`}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
      </div>

      {active === 'overview' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[{label:'Total Users', val: stats.totalUsers}, {label:'Total Videos', val: stats.totalVideos}, {label:'Total Views', val: stats.totalViews}, {label:'Storage Used', val: stats.storageUsed}].map((s,i) => (
            <div key={i} className="bg-slate-900 border border-slate-700 rounded-3xl p-6"><div className="text-3xl font-semibold">{s.val}</div><div className="text-sm text-slate-400 mt-1">{s.label}</div></div>
          ))}
        </div>
      )}

      {active === 'users' && (
        <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden">
          <table className="admin-table w-full text-sm">
            <thead><tr><th className="p-4 text-left">Email</th><th>Role</th><th>Videos</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-slate-800"><td className="p-4">{u.email}</td><td className="p-4"><span className={`px-3 py-0.5 text-xs rounded ${u.role==='ADMIN'?'bg-amber-500/20 text-amber-400':'bg-slate-700'}`}>{u.role}</span></td><td className="p-4">{u._count?.videos || 0}</td><td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td><td className="p-4"><button onClick={() => deleteUser(u.id)} className="text-red-400 text-xs">Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active === 'videos' && (
        <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden">
          <table className="admin-table w-full text-sm">
            <thead><tr><th className="p-4 text-left">Title</th><th>Owner</th><th>Views</th><th>Size</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id} className="border-t border-slate-800"><td className="p-4 font-medium">{v.title}</td><td className="p-4 text-slate-400">{v.user?.email}</td><td className="p-4">{v.viewsCount}</td><td className="p-4">{(v.size/1024/1024).toFixed(1)} MB</td><td className="p-4 text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</td><td><button onClick={() => deleteVideoAdmin(v.id)} className="text-red-400 text-xs">Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active === 'logs' && (
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-sm font-mono space-y-2 max-h-[600px] overflow-auto">
          {logs.length === 0 && <p className="text-slate-500">No logs yet.</p>}
          {logs.map(log => (
            <div key={log.id} className="flex gap-4 border-b border-slate-800 pb-2">
              <span className={`w-16 ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'}`}>{log.level}</span>
              <span className="flex-1 text-slate-300">{log.message}</span>
              <span className="text-slate-500 w-40 text-right">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
