import React from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans">
      {children}
    </div>
  )
}
