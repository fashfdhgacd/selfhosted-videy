import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Selfhosted Videy | Self-hosted Video Platform',
  description: 'Upload, host, embed and share videos on your own infrastructure. Free, open source, privacy-first video hosting.',
  icons: { icon: '/favicon.ico' },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-200 antialiased">
        <Navbar user={user} />
        <main>{children}</main>
        <Toaster position="top-center" toastOptions={{ className: 'bg-slate-800 text-white border border-slate-700' }} />
        <footer className="border-t border-slate-800 mt-20 py-8 text-center text-xs text-slate-500">
          Selfhosted Videy — Fully self-hosted • Open Source • MIT License
        </footer>
      </body>
    </html>
  )
}
