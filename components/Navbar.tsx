'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'

interface NavbarProps {
  user?: { email: string; role: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">Selfhosted Videy</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-primary-400 transition"><LayoutDashboard size={16} /> Dashboard</Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="flex items-center gap-2 hover:text-primary-400 transition"><Shield size={16} /> Admin</Link>
                )}
                <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
                  <span className="text-slate-400 text-sm">{user.email}</span>
                  <button onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2 text-sm hover:bg-slate-800 rounded-lg transition">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-primary-400 transition">Login</Link>
                <Link href="/register" className="px-5 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-sm font-medium transition">Get Started</Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 px-6 py-4 space-y-3 bg-slate-900">
          {user ? (
            <>
              <Link href="/dashboard" className="block py-2">Dashboard</Link>
              {user.role === 'ADMIN' && <Link href="/admin" className="block py-2">Admin Panel</Link>}
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-400">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2">Login</Link>
              <Link href="/register" className="block py-2 text-primary-400">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
