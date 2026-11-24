import type { ReactNode } from 'react'

export const metadata = { title: 'fallback: true with Cache Components' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-monospace, Menlo, monospace', margin: 32 }}>{children}</body>
    </html>
  )
}
