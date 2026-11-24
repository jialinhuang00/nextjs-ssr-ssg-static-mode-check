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
      {/* Outside <Suspense>, so it is in the first bytes together with the fallback. */}
      <p>
        <span data-l="en">First visit to an id: &quot;loading…&quot; shows first, then the page, the same as the Pages Router&apos;s fallback: true.</span>
        <span data-l="zh">第一次打開一個 id，會先出現 loading…，接著才是頁面，效果跟 Pages Router 的 fallback: true 一樣。</span>
      </p>
      <p style={{ color: '#b91c1c', fontWeight: 700 }}>
        <span data-l="en">Reload and this page breaks: only &quot;loading…&quot; arrives, then &quot;This page couldn&apos;t load&quot;. It happens on this Cloudflare deployment (OpenNext), not with next start.</span>
        <span data-l="zh">再 reload 這頁會壞掉，瀏覽器只收到 loading…，接著顯示「This page couldn&apos;t load」。這只發生在這個用 OpenNext 部署到 Cloudflare 的版本，用 next start 跑不會。</span>
      </p>
    </main>
  )
}
