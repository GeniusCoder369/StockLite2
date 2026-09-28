'use client'

import { useEffect, useState } from 'react'

// Reads/writes the same localStorage key and `data-theme` attribute that
// the inline script in app/layout.tsx sets before first paint (so there's
// no flash of the wrong theme on load).
export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    setTheme(current === 'dark' ? 'dark' : 'light')
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('stocklite-theme', next)
    } catch {
      // localStorage can throw in private-browsing contexts — theme just
      // won't persist across reloads, which is fine.
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle dark and light theme"
    >
      {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
    </button>
  )
}
