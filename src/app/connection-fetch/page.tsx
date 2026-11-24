import { connection } from 'next/server'

import { Stamp } from '../stamp'
import { UuidTable } from '../uuid-table'

export default async function Page() {
  await connection()
  // Two different query strings on purpose. Within one render Next gives two GET fetches of the
  // same URL one shared response, and `cache` is not part of what it compares
  // (node_modules/next/dist/server/lib/dedupe-fetch.js), so the same URL twice would be one call.
  const a = await fetch('https://httpbin.org/uuid?default')
  const b = await fetch('https://httpbin.org/uuid?force-cache', { cache: 'force-cache' })
  const { uuid: plain } = (await a.json()) as { uuid: string }
  const { uuid: cached } = (await b.json()) as { uuid: string }
  return (
    <Stamp route="/connection-fetch">
      <UuidTable
        id="/connection-fetch"
        rows={[
          { code: 'fetch(url)', uuid: plain, calls: { en: 'every time', zh: '每次都連' } },
          {
            code: "fetch(url, { cache: 'force-cache' })",
            uuid: cached,
            calls: { en: "the first time only; after that the response comes from Next's data cache", zh: '只有第一次，之後用 Next 的 data cache 裡存好的回應' },
          },
        ]}
      />
    </Stamp>
  )
}
