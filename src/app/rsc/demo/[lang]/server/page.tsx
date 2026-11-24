import { Code } from '../../../../highlight'
import { COPY, LANGS, langOf } from '../../copy'

// The left iframe on /rsc. No 'use client' anywhere in this file, so ServerDemo is a server
// component: it ran once, at build, and the browser gets only its HTML. The button has no
// onClick because a server component cannot hand a function to the browser; the click goes
// nowhere, with JS on or off.
export const dynamicParams = false
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

const SERVER_MARK = 'svc-server-mark-41c7'

function ServerDemo({ lang }: { lang: 'en' | 'zh' }) {
  const c = COPY[lang]
  return (
    <main className="demo" data-side="server">
      <p className="demo-count">
        <button type="button">+1</button>
        <output>0</output>
      </p>
      <dl>
        <dt>{c.width}</dt>
        <dd>—</dd>
        <dt>{c.who}</dt>
        <dd>{c.serverOnly}</dd>
      </dl>
      <details>
        <summary>{c.proof}</summary>
        <dl>
          <dt>typeof window</dt>
          <dd>{typeof window}</dd>
          <dt>process.env.RSC_DEMO_SERVER</dt>
          <dd>{process.env.RSC_DEMO_SERVER ?? 'undefined'}</dd>
          <dt>process.env.NEXT_PUBLIC_RSC_DEMO</dt>
          <dd>{process.env.NEXT_PUBLIC_RSC_DEMO ?? 'undefined'}</dd>
          <dt>{c.marker}</dt>
          <dd>{SERVER_MARK}</dd>
        </dl>
      </details>
    </main>
  )
}

// Under the demo, this file without the labels and the proof list: no 'use client', so both
// ServerDemo and Page are server components.
const FILE = 'server/page.tsx'
const EXCERPT = `// no 'use client' at the top: everything here is a server component
import { COPY, LANGS, langOf } from '../../copy'

const SERVER_MARK = 'svc-server-mark-41c7'

function ServerDemo({ lang }) {
  return (
    <main>
      <button>+1</button> {/* no onClick: a server component cannot send a function */}
      <output>0</output>
      <dd>—</dd>          {/* the server has no window to measure */}
    </main>
  )
}

export default async function Page({ params }) {
  return <ServerDemo lang={langOf((await params).lang)} />
}`

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return (
    <>
      <ServerDemo lang={langOf((await params).lang)} />
      <section className="demo-code">
        <h2>{FILE} (excerpt)</h2>
        <Code code={EXCERPT} />
      </section>
    </>
  )
}
