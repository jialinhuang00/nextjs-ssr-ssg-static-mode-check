'use client'
import { useEffect, useRef, useState } from 'react'

import { type L, T } from './i18n'

// One row per fetch: the uuid it got on the previous load next to the one it got on this load,
// so a reload shows whether it changed. The previous uuids are kept in sessionStorage under the
// page's route; the server does not know them.
type Row = { code: string; uuid: string; calls?: L }
const short = (uuid: string) => `${uuid.slice(0, 8)}…`

export function UuidTable({ id, rows }: { id: string; rows: Row[] }) {
  const [prev, setPrev] = useState<string[] | null>(null)
  const now = rows.map((r) => r.uuid).join(',')
  // next dev runs an effect twice; the second run would read the uuids the first run just stored
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    try {
      const raw = sessionStorage.getItem(`uuids:${id}`)
      if (raw) setPrev(raw.split(','))
      sessionStorage.setItem(`uuids:${id}`, now)
    } catch {}
  }, [id, now])

  const withCalls = rows.some((r) => r.calls)
  return (
    <table className="cmp">
      <thead>
        <tr>
          <th>fetch</th>
          <th>
            <T t={{ en: 'uuid, previous load', zh: '上一次的 uuid' }} />
          </th>
          <th>
            <T t={{ en: 'uuid, this load', zh: '這一次的 uuid' }} />
          </th>
          {withCalls && (
            <th>
              <T t={{ en: 'Calls httpbin', zh: '有沒有連到 httpbin' }} />
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.code}>
            <td>
              <code>{r.code}</code>
            </td>
            <td>
              <code>{prev?.[i] ? short(prev[i]) : '—'}</code>
            </td>
            <td>
              <code>{short(r.uuid)}</code>{' '}
              {prev?.[i] && <strong>{prev[i] === r.uuid ? <T t={{ en: 'same', zh: '沒換' }} /> : <T t={{ en: 'changed', zh: '換了' }} />}</strong>}
            </td>
            {withCalls && <td>{r.calls && <T t={r.calls} />}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
