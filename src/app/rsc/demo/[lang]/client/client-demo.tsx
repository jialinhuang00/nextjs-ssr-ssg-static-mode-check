'use client'
import { useEffect, useState } from 'react'

import { COPY } from '../../copy'

// The same markup as the server demo, as a client component. It runs twice: once on the
// server at build, which makes the HTML you see with JS off, and again in the browser, which
// attaches onClick and runs useEffect. Everything that only the browser knows is read in
// useEffect, so the two runs produce the same HTML and React reports no hydration mismatch.
const CLIENT_MARK = 'svc-client-mark-41c7'

type Seen = { width: number; where: string; secret?: string; pub?: string }

export function ClientDemo({ lang }: { lang: 'en' | 'zh' }) {
  const c = COPY[lang]
  const [n, setN] = useState(0)
  const [seen, setSeen] = useState<Seen | null>(null)

  useEffect(() => {
    const read = () =>
      setSeen({
        width: window.innerWidth,
        where: typeof window,
        secret: process.env.RSC_DEMO_SERVER,
        pub: process.env.NEXT_PUBLIC_RSC_DEMO,
      })
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  const show = (v?: string) => v ?? 'undefined'
  return (
    <main className="demo" data-side="client">
      <p className="demo-count">
        <button type="button" onClick={() => setN(n + 1)}>
          +1
        </button>
        <output>{n}</output>
      </p>
      <dl>
        <dt>{c.width}</dt>
        <dd>{seen ? seen.width : '—'}</dd>
        <dt>{c.who}</dt>
        <dd>{seen ? c.hydrated : c.serverOnly}</dd>
      </dl>
      <details>
        <summary>{c.proof}</summary>
        <dl>
          <dt>typeof window</dt>
          <dd>{seen ? seen.where : 'undefined'}</dd>
          <dt>process.env.RSC_DEMO_SERVER</dt>
          <dd>{show(seen?.secret)}</dd>
          <dt>process.env.NEXT_PUBLIC_RSC_DEMO</dt>
          <dd>{seen ? show(seen.pub) : 'undefined'}</dd>
          <dt>{c.marker}</dt>
          <dd>{CLIENT_MARK}</dd>
        </dl>
      </details>
    </main>
  )
}
