import type { ReactNode } from "react";

import { Age, Fill, FreshLink, LocalTime, ReloadButton, T } from "./i18n";
import { compareOf, findRoute, modeKind, modeLabel } from "./routes";
import { sourceFor } from "./source-for";
import { type Line, lcsDiff } from "./diff";
import { type Pair, Tokens } from "./tokens";

// Every route renders one of these. "rendered at" is the time this HTML was produced:
// a static route keeps showing its build time, a dynamic one changes on every reload,
// an ISR route changes at most once per revalidate window.
export function Stamp({
  route,
  detail,
  children,
}: {
  route: string;
  detail?: string;
  children?: ReactNode;
}) {
  const info = findRoute(route);
  const other = info && compareOf(info);
  const renderedAt = new Date().toISOString();
  const source = info && sourceFor(info.base);
  const from = info?.diffFrom ? sourceFor(info.diffFrom) : undefined;
  const lines =
    source &&
    (from
      ? diffLines(
          from.code.split("\n"),
          source.code.split("\n"),
          info!.diffFrom!,
          info!.base,
        )
      : source.code.split("\n").map((text) => ({ op: " " as const, text })));
  return (
    <main className="stamp">
      <header>
        <h1>{route}</h1>
      </header>
      <div className="left">
        {/* one row of label + value pairs; each pair is wrapped so a line break never splits it */}
        <dl className="facts">
          <div className="fact">
            <dt>mode</dt>
            <dd className="mode" data-kind={info ? modeKind(info) : undefined}>
              {info ? modeLabel(info) : "?"}
            </dd>
            {/* seconds since this HTML was made, as a badge next to the mode */}
            <dd className="age" data-kind={info ? modeKind(info) : undefined}>
              <Age />
            </dd>
          </div>
          {other && (
            <div className="fact">
              <dt>
                <T t={{ en: "compare with", zh: "對照" }} />
              </dt>
              <dd>
                <a href={other.href}>{other.href}</a>
              </dd>
            </div>
          )}
          <div className="fact">
            <dt>
              <T t={{ en: "rendered at", zh: "產生時間" }} />
            </dt>
            <dd>
              <time data-rendered hidden suppressHydrationWarning>
                {renderedAt}
              </time>
              <LocalTime /> <ReloadButton />
            </dd>
          </div>
          {detail && (
            <div className="fact">
              <dt>
                <T t={{ en: "data", zh: "資料" }} />
              </dt>
              <dd>{detail}</dd>
            </div>
          )}
        </dl>
        {info && (
          <section className="how">
            {info.timeline && (
              <ol className="timeline">
                {info.timeline.map((row) => (
                  <li key={row.at} data-tone={row.tone}>
                    <time>{row.at}</time>
                    <span>
                      <T t={row.what} />
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <p>
              <Fill t={info.test} />
            </p>
            {info.table && (
              <table className="cmp">
                <thead>
                  <tr>
                    {info.table.head.map((h, i) => (
                      <th key={i}>
                        <T t={h} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {info.table.rows.map((row, i) => (
                    <tr key={i} aria-current={row.includes(route) || undefined}>
                      {row.map((c, j) => (
                        <td key={j}>
                          {typeof c !== "string" ? <T t={c} /> : c.startsWith("/") ? <a href={c}>{c}</a> : <code>{c}</code>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {info.fresh && (
              <p>
                <FreshLink prefix={info.fresh} />
              </p>
            )}
            {info.try && (
              <p>
                {info.try.map((href) => (
                  // another site opens in a new tab: inside the home page's iframe it would replace this page
                  <a key={href} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{ marginRight: 12 }}>
                    {href}
                  </a>
                ))}
              </p>
            )}
          </section>
        )}
        {children}
      </div>
      {source && (
        <section className="code">
          {!from && <h2>{source.file}</h2>}
          <pre>
            <code>
              {/* a unified-diff header, as `diff -u` / `git diff` print it */}
              {from && (
                <>
                  <span className="hdr">--- a/{from.file}</span>
                  <span className="hdr">+++ b/{source.file}</span>
                </>
              )}
              {withTokens(lines!, from?.tokens ?? [], source.tokens).map((l, i) => (
                <span
                  key={i}
                  className={
                    l.op === "+" ? "add" : l.op === "-" ? "del" : undefined
                  }
                >
                  {from ? `${l.op} ` : ""}
                  <Tokens line={l.tokens} />
                </span>
              ))}
            </code>
          </pre>
        </section>
      )}
    </main>
  );
}

// The base file's own route string (route="/static") is swapped for this route's before
// comparing, so the diff shows the factor and not the name change.
function diffLines(a: string[], b: string[], fromBase: string, base: string): Line[] {
  return lcsDiff(a.map((l) => l.split(`"${fromBase}`).join(`"${base}`)), b)
}

// Colour each diff line with the tokens of the file it came from: a "-" line is the old file's
// next line, a "+" line the new file's, a " " line both (the new file's tokens are used).
// The colours come from scripts/gen-sources.mjs, worked out per whole file, so multi-line
// comments stay coloured. A "-" line keeps the old file's own route string in its colours;
// the swap in diffLines only decides which lines count as changed.
function withTokens(lines: Line[], a: Pair[][], b: Pair[][]) {
  let i = 0
  let j = 0
  return lines.map((l) => {
    if (l.op === "-") return { op: l.op, tokens: a[i++] ?? [] }
    if (l.op === "+") return { op: l.op, tokens: b[j++] ?? [] }
    i++
    return { op: l.op, tokens: b[j++] ?? [] }
  })
}
