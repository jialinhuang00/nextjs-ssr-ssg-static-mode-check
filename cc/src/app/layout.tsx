import type { ReactNode } from 'react'

export const metadata = { title: 'fallback: true with Cache Components' }

// The page text is in the HTML in both languages. This script picks one from the browser's
// language before the body is drawn, and the CSS hides the other. Reading the language on the
// server would need the request, which would change what this app is testing. The main site's
// choice is in its own localStorage, which another domain cannot read.
const pickLang = `document.documentElement.dataset.lang = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'`
const hideOther = `[data-lang='zh'] [data-l='en'], [data-lang='en'] [data-l='zh'] { display: none }`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{hideOther}</style>
        <script dangerouslySetInnerHTML={{ __html: pickLang }} />
      </head>
      <body style={{ fontFamily: 'ui-monospace, Menlo, monospace', margin: 32 }}>{children}</body>
    </html>
  )
}
