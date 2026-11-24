import { Code } from '../../../../highlight'
import { LANGS, langOf } from '../../copy'
import { ClientDemo } from './client-demo'

// The right iframe on /rsc. This page file is a server component; the demo itself is in
// client-demo.tsx, which starts with 'use client'.
export const dynamicParams = false
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

// Under the demo, this page and client-demo.tsx without the labels and the proof list. Page
// here is a server component; only ClientDemo, behind 'use client', is a client component.
const FILE = 'client/page.tsx + client-demo.tsx'
const EXCERPT = `// client/page.tsx: no 'use client', so Page is a server component
export default async function Page({ params }) {
  return <ClientDemo lang={langOf((await params).lang)} />
}

// client/client-demo.tsx
'use client'
import { useEffect, useState } from 'react'

const CLIENT_MARK = 'svc-client-mark-41c7'

export function ClientDemo({ lang }) {
  const [n, setN] = useState(0)
  const [seen, setSeen] = useState(null)
  useEffect(() => setSeen({ width: window.innerWidth /* … */ }), []) // browser only

  return (
    <main>
      <button onClick={() => setN(n + 1)}>+1</button>
      <output>{n}</output>
      <dd>{seen ? seen.width : '—'}</dd>
    </main>
  )
}`

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return (
    <>
      <ClientDemo lang={langOf((await params).lang)} />
      <section className="demo-code">
        <h2>{FILE} (excerpt)</h2>
        <Code code={EXCERPT} />
      </section>
    </>
  )
}
