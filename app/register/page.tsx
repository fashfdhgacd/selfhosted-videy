'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      toast.success('Account created! Please login.')
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-slate-400 mt-2">Start hosting videos in under 60 seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5">
          <div>
            <label className="block text-sm mb-1.5 text-slate-400">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3" placeholder="you@yourdomain.com" />
          </div>
          <div>
            <label className="block text-sm mb-1.5 text-slate-400">Password (min 8 chars)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-70 rounded-2xl font-medium transition">
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>

          <p className="text-center text-sm text-slate-500 pt-2">By registering you agree to our simple terms. No tracking. No ads.</p>
          <p className="text-center text-sm"><Link href="/login" className="text-primary-400">Already have an account? Sign in</Link></p>
        </form>
      </div>
    </div>
  )
}
