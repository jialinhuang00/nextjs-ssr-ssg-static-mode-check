'use client'
import { useEffect, useRef, useState, useTransition } from 'react'

import { T } from '../i18n'

// One press shows two renders, and this component names both.
//   B  the action's response carries a newly rendered page, so time[data-rendered] changes at
//      once. That render is not stored (measured on the deployed site: the next request is a
//      cache MISS).
//   C  the reload after it. The server renders again and stores this one; later reloads get C.
// The button reloads by itself after B, and B is kept in sessionStorage so it can still be
// shown next to C once the page is back.
const KEY = 'isr-on-demand:b'
const renderedEl = () => document.querySelector('time[data-rendered]')
// With milliseconds: the reload follows the press at once, so B and C often fall in the same second.
const clock = (iso: string) => {
  const d = new Date(iso)
  return `${d.toLocaleTimeString('sv-SE')}.${String(d.getMilliseconds()).padStart(3, '0')}`
}

export function RevalidateButton({ action }: { action: () => Promise<void> }) {
  const [pending, start] = useTransition()
  const [b, setB] = useState<string | null>(null)
  const [c, setC] = useState<string | null>(null)

  // After the reload: the stored B, and C read from this page's own <time>.
  useEffect(() => {
    const stored = sessionStorage.getItem(KEY)
    if (!stored) return
    sessionStorage.removeItem(KEY)
    setB(stored)
    setC(renderedEl()?.textContent ?? null)
  }, [])

  // React rewrites the <time> in the same commit that ends the transition, not while the
  // transition's function is still running. So B is read here, once pending is false again.
  const pressed = useRef(false)
  useEffect(() => {
    if (pending || !pressed.current) return
    pressed.current = false
    const made = renderedEl()?.textContent ?? ''
    sessionStorage.setItem(KEY, made)
    setB(made)
    location.reload()
  }, [pending])

  function press() {
    setB(null)
    setC(null)
    pressed.current = true
    start(async () => {
      await action()
    })
  }

  return (
    <div>
      <button type="button" className="btn" disabled={pending || (b !== null && c === null)} onClick={press}>
        revalidatePath(&apos;/isr-on-demand&apos;)
      </button>
      {pending && <p className="hint">…</p>}
      {b && !c && (
        <p className="hint">
          <T t={{ en: `Made again at ${clock(b)}, not stored. Reloading…`, zh: `${clock(b)} 重新產生了一次，這次沒有存起來。reloading…` }} />
        </p>
      )}
      {b && c && (
        <>
          <p className="hint">
            <T t={{ en: `Press: made at ${clock(b)}, not stored.`, zh: `按下去：${clock(b)} 產生，沒有存起來。` }} />
          </p>
          <p className="hint">
            <T
              t={{
                en: `Reload: made at ${clock(c)}, stored.`,
                zh: `reload：${clock(c)} 產生，存起來了。`,
              }}
            />
          </p>
        </>
      )}
    </div>
  )
}
