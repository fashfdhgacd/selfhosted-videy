'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      toast.success('Welcome back!')
      window.location.href = '/dashboard'
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
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-slate-400 mt-2">Sign in to your Selfhosted Videy account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5">
          <div>
            <label className="block text-sm mb-1.5 text-slate-400">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-500" placeholder="you@domain.com" />
          </div>
          <div>
            <label className="block text-sm mb-1.5 text-slate-400">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-500" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-70 rounded-2xl font-medium transition">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="flex justify-between text-sm pt-2">
            <Link href="/forgot-password" className="text-primary-400 hover:underline">Forgot password?</Link>
            <Link href="/register" className="text-slate-400 hover:text-white">Create account →</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
