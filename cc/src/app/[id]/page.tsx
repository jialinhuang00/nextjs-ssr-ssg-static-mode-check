import { Suspense } from 'react'

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }]
}

// 'use cache' lets the finished result be stored. The 2 s wait (unlisted ids only) is
// there so the fallback has time to show. It is a fetch to httpbin's delay endpoint, not
// setTimeout: on Workers, Next warns that setTimeout breaks Cache Components; the time is read inside the cache, so it is the
// moment this id was made, not the moment of the request.
async function getItem(id: string) {
  'use cache'
  if (!['1', '2', '3'].includes(id)) await fetch('https://httpbin.org/delay/2')
  return { id, renderedAt: new Date().toISOString() }
}

// params is awaited inside <Suspense>, as the docs require for the fallback to be served
// first (with partialPrefetching on).
async function Item({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getItem(id)
  return (
    <>
      <h1>/{item.id}</h1>
      <p>
        rendered at <time data-rendered="">{item.renderedAt}</time>
      </p>
    </>
  )
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <Suspense fallback={<h1>loading…</h1>}>
        <Item params={params} />
      </Suspense>
    </main>
  )
}
