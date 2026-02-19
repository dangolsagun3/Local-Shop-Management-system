'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/common/Sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="bg-gray-50 min-h-screen">
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
