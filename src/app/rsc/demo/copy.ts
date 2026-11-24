// Words for the two demo pages inside the /rsc iframes. The language comes from the path
// (/rsc/demo/zh/client), not from the usual script on <html>: with the browser's JS switched off
// in the iframe, that script never runs, and the page would always show English.
export type Lang = 'en' | 'zh'

export const LANGS: Lang[] = ['en', 'zh']

export const COPY = {
  en: {
    width: 'window width',
    who: 'has run in',
    serverOnly: 'the server only',
    hydrated: 'the server, then this browser',
    proof: 'proof',
    marker: 'marker',
  },
  zh: {
    width: '視窗寬度',
    who: '在哪裡跑過',
    serverOnly: '只在 server',
    hydrated: 'server，再來是這個瀏覽器',
    proof: '證據',
    marker: '標記',
  },
} as const

export function langOf(s: string): Lang {
  return s === 'zh' ? 'zh' : 'en'
}
