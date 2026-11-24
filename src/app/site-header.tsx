'use client'
import { useLang } from './i18n'

// The one header line shared by the home page and /about, so both pages start the same way.
// The page you are on is shown as text, the other one as a link.
// onLang lets the home page reload its iframe, whose page reads the language when it loads.
export function SiteHeader({ at, onLang }: { at: 'modes' | 'rsc' | 'about'; onLang?: () => void }) {
  const [lang, setLang] = useLang()
  return (
    <header className="site-header">
      <h1>
        <a href="/">Next.js rendering modes</a>
      </h1>
      <span className="legend">Next.js 16.4</span>
      <nav className="legend">
        {(['modes', 'rsc', 'about'] as const).map((p) =>
          p === at ? (
            <span key={p} aria-current="page">
              {p}
            </span>
          ) : (
            <a key={p} href={p === 'modes' ? '/' : `/${p}`}>
              {p}
            </a>
          ),
        )}
      </nav>
      <span className="lang">
        {(['en', 'zh'] as const).map((l) => (
          <button
            key={l}
            type="button"
            className="btn"
            aria-pressed={lang === l}
            onClick={() => {
              setLang(l)
              onLang?.()
            }}
          >
            {l === 'en' ? 'EN' : '中文'}
          </button>
        ))}
      </span>
    </header>
  )
}
