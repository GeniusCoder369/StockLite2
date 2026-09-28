'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/inventory', label: 'Inventory' },
  { href: '/stock', label: 'Stock In / Out' },
  { href: '/transfer', label: 'Transfer' },
  { href: '/history', label: 'History' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sidebar">
      <Link href="/" className="sidebar-brand">
        StockLite <span>WMS</span>
      </Link>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
        >
          {link.label}
        </Link>
      ))}
      <div className="sidebar-footer">
        Signed in as <strong>Staff</strong>
        <br />
        <Link
          href="/login"
          className="sidebar-link"
          style={{ padding: '6px 0 0' }}
        >
          Switch user
        </Link>
      </div>
    </nav>
  )
}
