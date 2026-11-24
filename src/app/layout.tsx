import { JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import './globals.css'

// Two families only: JetBrains Mono for headings, labels, times and code; the system sans
// (PingFang TC on a Mac) for prose, so English and zh in a paragraph use matching faces.
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono' })

export const metadata = { title: 'Next.js rendering modes' }

// Runs before paint in every page (the home page and each page inside its iframe), so the
// hidden language never flashes. Same origin, so the iframe reads the same localStorage.
// ?lang=zh / ?lang=en also works, read here in the browser (not through searchParams, which
// would make the route dynamic) and remembered for the pages inside the iframe.
const LANG_SCRIPT = `try{var q=new URLSearchParams(location.search).get('lang');if(q==='zh'||q==='en')localStorage.setItem('modes-lang',q);var l=localStorage.getItem('modes-lang');if(l==='zh')document.documentElement.dataset.lang='zh';if(self!==top)document.documentElement.classList.add('framed')}catch(e){}`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
