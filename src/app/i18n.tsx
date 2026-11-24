'use client'
import { useEffect, useState } from 'react'

// Both languages are in the HTML and CSS hides one, keyed on <html data-lang>.
// Reading the language from cookies() or searchParams would make every route dynamic,
// which is exactly what this app is trying to observe, so the choice lives in localStorage.
export type L = { en: string; zh: string }
export type Lang = 'en' | 'zh'

export const LANG_KEY = 'modes-lang'

export function T({ t }: { t: L }) {
  return (
    <>
      <span data-l="en">{t.en}</span>
      <span data-l="zh">{t.zh}</span>
    </>
  )
}

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {}
  document.documentElement.dataset.lang = lang
}

// When this HTML was made. Read from the server-rendered <time data-rendered>, never from a
// prop: under "use client" the Stamp runs again in the browser at hydration, and new Date()
// there is the browser's now. The <time> keeps the HTML's text (suppressHydrationWarning),
// so the DOM is the only place that still holds the server's value.
function useRendered() {
  const [iso, setIso] = useState<string | null>(null)
  useEffect(() => {
    const el = document.querySelector('time[data-rendered]')
    const read = () => setIso(el?.textContent ?? null)
    read()
    if (!el) return
    // A server action that calls revalidatePath sends back a new tree and React rewrites this
    // element's text in place; read it again, or the shown time stays at the old render.
    const mo = new MutationObserver(read)
    mo.observe(el, { childList: true, characterData: true, subtree: true })
    return () => mo.disconnect()
  }, [])
  return iso
}

// The render time in the viewer's own time zone, no zone name: 2026/11/22 11:15:59.
// Built from the parts so every zone gets the same shape (two-digit hour included).
function local(iso: string) {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

export function LocalTime() {
  const iso = useRendered()
  return <>{iso ? local(iso) : ''}</>
}

// Text with {rendered} filled in with the local render time once the page has loaded.
// [words](href) in the text becomes a link on those words. Another site opens in a new tab:
// inside the home page's iframe it would replace the page being read.
export function Fill({ t }: { t: L }) {
  const iso = useRendered()
  const at = iso ? local(iso) : '…'
  const parts = (s: string) =>
    s.split('{rendered}').join(at).split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (!m) return part
      return (
        <a key={i} href={m[2]} target={m[2].startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          {m[1]}
        </a>
      )
    })
  return (
    <>
      <span data-l="en">{parts(t.en)}</span>
      <span data-l="zh">{parts(t.zh)}</span>
    </>
  )
}

// Seconds since this HTML was rendered. For a static page it keeps growing from build time;
// for a dynamic one it restarts at 0 on every reload.
export function Age() {
  const iso = useRendered()
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  if (now === null || !iso) return null
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000))
  // key changes every second, so React mounts a new span and its CSS flash plays again,
  // like a stock quote lighting up when the price moves
  return (
    <span key={s} className="tick">
      {s}s
    </span>
  )
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, set] = useState<Lang>('en')
  useEffect(() => {
    set(document.documentElement.dataset.lang === 'zh' ? 'zh' : 'en')
  }, [])
  return [
    lang,
    (l) => {
      setLang(l)
      set(l)
    },
  ]
}

// Reload inside the page itself, next to the time it is meant to change; the home page's
// reload button is far away at the top right.
// The old page stays on screen until the new one arrives, so the button says it is waiting.
export function ReloadButton() {
  const [loading, setLoading] = useState(false)
  return (
    <button
      type="button"
      className="btn reload"
      disabled={loading}
      aria-busy={loading}
      onClick={() => {
        setLoading(true)
        location.reload()
      }}
    >
      {loading ? 'loading…' : 'reload'}
    </button>
  )
}

// A link to an id nobody has opened yet. The id is picked at click time, in the browser:
// picked on the server it would be baked into the stored page and every visitor would get
// the same one.
export function FreshLink({ prefix }: { prefix: string }) {
  return (
    <a
      href={prefix}
      onClick={(e) => {
        e.preventDefault()
        // A full page load. router.push was tried on the deployed site and showed no loading
        // screen either (Gin G2), so it buys nothing here.
        location.assign(prefix + (1000 + Math.floor(Math.random() * 1e9)))
      }}
    >
      <T t={{ en: 'open a new id', zh: '打開一個新的 id' }} />
    </a>
  )
}
