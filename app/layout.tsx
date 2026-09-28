import type { Metadata } from 'next'
import { Archivo, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['500', '700'],
})
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-plex',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'StockLite — Warehouse Inventory',
  description: 'Warehouse inventory system for the StockLite coding exercise.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexSans.variable}`}>
      <head>
        {/* Runs before React hydrates so the page paints in the right
            theme immediately — otherwise a dark-mode visitor would see a
            flash of the light theme on every load. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('stocklite-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
