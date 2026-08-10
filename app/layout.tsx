import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { AuthorApplicationModal } from '@/components/auth/AuthorApplicationModal'

export const metadata: Metadata = {
  title: 'Chronicle — Modern Multi-Author Publication Platform',
  description: 'Chronicle is an open digital publishing and blogging platform built for software engineers, designers, and technical creators.',
  verification: {
    google: 'FvcKBOYw2eTGOkxdA8PApmI1MeJBGf-4AVOtjHu7Tek',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F17] text-slate-100 antialiased">
        <AppProvider>
          {children}
          <AuthorApplicationModal />
        </AppProvider>
      </body>
    </html>
  )
}
