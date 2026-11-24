'use client'
import { useEffect, useState } from 'react'

import { T } from '../i18n'

// The two iframes at the top of /rsc and the switch for the browser's JS inside them.
// JS off is the sandbox attribute without allow-scripts: the browser loads the same HTML and
// runs none of its scripts. allow-same-origin stays, so this page can still read the iframe's
// <script src> list and search those files for the markers.
type Side = 'server' | 'client'
const SIDES: Side[] = ['server', 'client']

// Built from pieces, so this file's own JS never holds either marker in one piece.
const MARK: Record<Side, string> = {
  server: ['svc', 'server', 'mark', '41c7'].join('-'),
  client: ['svc', 'client', 'mark', '41c7'].join('-'),
}

// The language the header buttons set on <html data-lang>, followed as it changes.
function useHtmlLang() {
  const [lang, setLang] = useState<'en' | 'zh' | null>(null)
  useEffect(() => {
    const html = document.documentElement
    const read = () => setLang(html.dataset.lang === 'zh' ? 'zh' : 'en')
    read()
    const mo = new MutationObserver(read)
    mo.observe(html, { attributes: true, attributeFilter: ['data-lang'] })
    return () => mo.disconnect()
  }, [])
  return lang
}

async function search(frame: HTMLIFrameElement, side: Side) {
  const doc = frame.contentDocument
  if (!doc) return null
  const urls = Array.from(doc.querySelectorAll<HTMLScriptElement>('script[src]'), (s) => s.src)
  const files = await Promise.all(urls.map((u) => fetch(u).then((r) => r.text())))
  return { files: urls.length, found: files.some((f) => f.includes(MARK[side])) }
}

export function RscDemo() {
  const lang = useHtmlLang()
  const [js, setJs] = useState(true)
  const [found, setFound] = useState<Record<Side, { files: number; found: boolean } | null>>({
    server: null,
    client: null,
  })

  return (
    <>
      <div className="rsc-switch">
        <span>
          <T t={{ en: 'JS in the browser', zh: '瀏覽器的 JS' }} />
        </span>
        {[true, false].map((on) => (
          <button key={String(on)} type="button" aria-pressed={js === on} onClick={() => setJs(on)}>
            <T t={on ? { en: 'on', zh: '開' } : { en: 'off', zh: '關' }} />
          </button>
        ))}
        <span className="rsc-hint">
          <T
            t={{
              en: 'This switch turns off JS only inside the two boxes below; no browser setting needed.',
              zh: '這個開關只會關掉下面兩個框裡的 JS，不用去改瀏覽器設定。',
            }}
          />
        </span>
      </div>
      <div className="rsc-pair">
        {SIDES.map((side) => (
          <figure key={side} data-side={side}>
            <figcaption>
              {side} component
              {!js && (
                <span className="rsc-off">
                  <T t={{ en: 'JS off', zh: 'JS 已關閉' }} />
                </span>
              )}
            </figcaption>
            {lang && (
              <iframe
                // a new key reloads the iframe: a changed sandbox attribute only applies to the next load
                key={`${side}-${js}-${lang}`}
                title={`${side} component`}
                src={`/rsc/demo/${lang}/${side}`}
                sandbox={js ? undefined : 'allow-same-origin'}
                onLoad={(e) => {
                  const frame = e.currentTarget
                  setFound((f) => ({ ...f, [side]: null }))
                  search(frame, side)
                    .then((r) => setFound((f) => ({ ...f, [side]: r })))
                    .catch(() => {})
                }}
              />
            )}
            <p className="rsc-found">
              <code>{MARK[side]}</code>{' '}
              {found[side] ? (
                <T
                  t={
                    found[side].found
                      ? { en: `found in the page's ${found[side].files} JS files`, zh: `在這頁的 ${found[side].files} 個 JS 檔裡找得到` }
                      : { en: `not in any of the page's ${found[side].files} JS files`, zh: `這頁的 ${found[side].files} 個 JS 檔裡都找不到` }
                  }
                />
              ) : (
                '…'
              )}
            </p>
          </figure>
        ))}
      </div>
    </>
  )
}
