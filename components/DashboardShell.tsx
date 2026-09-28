'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const TITLES: Record<string, string> = {
  '/inventory': 'Inventory',
  '/stock': 'Stock In / Out',
  '/transfer': 'Transfer',
  '/history': 'History',
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <Link href="/" className="back-link">
            <span aria-hidden="true">←</span> Back to home
          </Link>
          <span className="crumb">{TITLES[pathname] ?? ''}</span>
        </div>
        <div className="page-fade">{children}</div>
      </main>
    </div>
  )
}
