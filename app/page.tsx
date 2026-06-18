'use client'

import Link from 'next/link'
import { Play, Upload, Users, BarChart3, Shield, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-800 text-sm mb-6 border border-slate-700">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> 100% Self-Hosted & Open Source
        </div>
        <h1 className="text-6xl md:text-7xl font-semibold tracking-tighter mb-6">
          Your videos.<br />Your server.<br />Your rules.
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-10">
          Production-ready self-hosted video hosting platform. Upload, embed, analyze — just like Videy.com but completely free and under your control.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-lg font-medium transition flex items-center justify-center gap-2">
            Start Hosting Free <Upload size={20} />
          </Link>
          <Link href="/login" className="px-8 py-4 border border-slate-700 hover:bg-slate-900 rounded-2xl text-lg font-medium transition">
            Login to Dashboard
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate-500">Docker one-command deploy • SQLite • FFmpeg thumbnails • JWT secured</p>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Upload className="text-primary-400" />, title: "Instant Upload & Bulk", desc: "Drag & drop or bulk upload with real-time progress. Automatic thumbnails & metadata via FFmpeg." },
            { icon: <Play className="text-primary-400" />, title: "Beautiful Player & Embeds", desc: "Custom HTML5 player with PiP, speed control, fullscreen. Auto-generated watch, embed, direct & short URLs + iframe code." },
            { icon: <BarChart3 className="text-primary-400" />, title: "Analytics & Insights", desc: "Track total views, unique viewers, watch duration. Popular videos dashboard for users and admins." },
            { icon: <Users className="text-primary-400" />, title: "Folders, Tags & Organization", desc: "Organize videos into folders. Tag them. Powerful search and filtering in your dashboard." },
            { icon: <Shield className="text-primary-400" />, title: "Enterprise Security", desc: "JWT httpOnly cookies, rate limiting, file validation, CSRF/XSS/SQL injection protection built-in." },
            { icon: <Zap className="text-primary-400" />, title: "API First & Extensible", desc: "Full REST API with API keys for automation. Webhook ready. Easy to extend or integrate." },
          ].map((f, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-primary-500/50 transition">
              <div className="mb-5">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 border-y border-slate-800 py-16">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl font-semibold tracking-tight mb-4">Ready to self-host your video platform?</h2>
          <p className="text-slate-400 mb-8">Clone, docker compose up, and you have a complete Videy alternative running in minutes.</p>
          <Link href="https://github.com/fashfdhgacd/selfhosted-videy" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-2xl font-medium hover:bg-slate-100 transition">
            View on GitHub →
          </Link>
        </div>
      </div>
    </div>
  )
}
