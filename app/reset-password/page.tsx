'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return toast.error('Invalid reset token')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Password updated! Please login.')
      window.location.href = '/login'
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight text-center mb-8">Set new password</h1>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="New password (min 8 chars)" className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3" />
          <button disabled={loading} className="w-full py-3.5 bg-primary-500 rounded-2xl font-medium">{loading ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  )
}
