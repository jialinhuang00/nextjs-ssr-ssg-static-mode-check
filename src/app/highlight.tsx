import 'server-only'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import json from 'shiki/langs/json.mjs'
import tsx from 'shiki/langs/tsx.mjs'
import githubLight from 'shiki/themes/github-light.mjs'

import { type Pair, Tokens } from './tokens'

// Syntax colours for code written inline in a server component (the snippets on /rsc).
// Page files get their colours at build instead, in scripts/gen-sources.mjs.
// 'server-only': a client component importing this fails the build, so the highlighter never
// ships to the browser. Sync highlighter with the JavaScript regex engine: no WASM, and no
// module-level promise, which one request would create and another await; the Workers runtime
// refuses that ("This promise was created by a request that has since ended").
const hl = createHighlighterCoreSync({
  themes: [githubLight],
  langs: [tsx, json],
  engine: createJavaScriptRegexEngine(),
})

export function Code({ code, lang = 'tsx' }: { code: string; lang?: 'tsx' | 'json' }) {
  const lines: Pair[][] = hl
    .codeToTokensBase(code, { lang, theme: 'github-light' })
    .map((line) => line.map((t) => [t.content, t.color ?? 'inherit']))
  return <Block lines={lines} />
}

export function Block({ lines }: { lines: Pair[][] }) {
  return (
    <pre className="hl">
      <code>
        {lines.map((line, i) => (
          <span key={i} className="line">
            <Tokens line={line} />
          </span>
        ))}
      </code>
    </pre>
  )
}
