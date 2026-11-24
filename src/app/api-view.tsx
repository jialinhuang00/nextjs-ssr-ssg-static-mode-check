'use client'
import { useEffect, useRef, useState } from 'react'

import { type Line, lcsDiff } from './diff'
import { T } from './i18n'

// A route handler returns JSON, so instead of an iframe the home page fetches it and keeps
// the previous answer. On reload the two are diffed: a dynamic handler shows renderedAt
// changing (red old line, green new line); a force-static one shows no change at all.
export function ApiView({ href, nonce, onDone }: { href: string; nonce: number; onDone: () => void }) {
  const prev = useRef<{ href: string; text: string } | null>(null)
  const [lines, setLines] = useState<Line[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [first, setFirst] = useState(true) // no earlier response for this href to diff against

  useEffect(() => {
    let live = true
    fetch(href, { cache: 'no-store' })
      .then((r) => r.json())
      .then((body) => {
        if (!live) return
        const text = JSON.stringify(body, null, 2)
        const before = prev.current?.href === href ? prev.current.text : null
        setLines(before === null ? text.split('\n').map((t) => ({ op: ' ', text: t })) : lcsDiff(before.split('\n'), text.split('\n')))
        setError(null)
        setFirst(before === null)
        prev.current = { href, text }
      })
      .catch((e: unknown) => live && setError(String(e)))
      .finally(() => live && onDone())
    return () => {
      live = false
    }
  }, [href, nonce, onDone])

  const changed = lines?.some((l) => l.op !== ' ')
  return (
    <div className="api">
      <p className="api-head">
        {error ? (
          error
        ) : changed ? null : first ? (
          <T t={{ en: 'First response. Press reload to compare with the next one.', zh: '第一次的回應。按 reload，這份回應會拿去跟下一次的比。' }} />
        ) : (
          <T t={{ en: 'Identical to the last response, renderedAt included.', zh: '跟上一次 reload 的回應一模一樣，renderedAt 也沒變。' }} />
        )}
      </p>
      <pre>
        <code>
          {lines?.map((l, i) => (
            <span key={i} className={l.op === '+' ? 'add' : l.op === '-' ? 'del' : undefined}>
              {l.op === ' ' ? '  ' : `${l.op} `}
              {l.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
