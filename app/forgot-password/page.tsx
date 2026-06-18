'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      setSent(true)
      toast.success('If account exists, reset instructions sent (check console if no email configured)')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-3">Check your email (or console)</h2>
          <p className="text-slate-400">We have sent password reset instructions. The link is also logged in server console for development.</p>
          <Link href="/login" className="mt-6 inline-block text-primary-400">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-2 tracking-tight">Forgot your password?</h1>
        <p className="text-center text-slate-400 mb-8">Enter your email and we\'ll send a reset link.</p>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="your@email.com" className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3" />
          <button disabled={loading} className="w-full py-3.5 bg-primary-500 rounded-2xl font-medium">{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
      </div>
    </div>
  )
}
