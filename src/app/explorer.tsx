"use client";
import { Fragment, useCallback, useState } from "react";

import { T } from "./i18n";
import { SiteHeader } from "./site-header";
import type { Kind, RouteInfo } from "./routes";
import { ApiView } from "./api-view";
import { sourceFor } from "./source-for";
import { EXTRA_NOTES } from "./extra-notes";
import { compareOf, KINDS, modeKind, modeLabel } from "./routes";

// Buttons swap the iframe's URL; "reload" requests the same URL again, which is what
// shows whether the page's "rendered at" time moves. Switching language reloads the
// iframe too, because the page inside reads the language when it loads.
// The route list sits in a sidebar, grouped and coloured by mode, so the iframe gets
// the full height of the viewport below one short header line.
export function Explorer({ routes }: { routes: RouteInfo[] }) {
  const [current, setCurrent] = useState(routes[0]);
  // What the iframe was told to load. Kept apart from `current` so that following a link
  // inside the iframe can update the sidebar without reloading the iframe a second time.
  const [src, setSrc] = useState(routes[0].href);
  const go = (r: RouteInfo) => {
    setCurrent(r);
    setSrc(r.href);
    setAt(r.href);
  };
  // Where the iframe actually is, which a link inside it may have changed (/ssg/2, ?q=bye).
  // reload and open use this, not current.href, so they stay on that page.
  const [at, setAt] = useState(routes[0].href);
  const [nonce, setNonce] = useState(0);
  // Each mode group opens and closes on its own; all start open.
  const [shut, setShut] = useState<Set<Kind>>(new Set());
  const toggle = (k: Kind) =>
    setShut((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const [warn, setWarn] = useState(true); // not stored: it comes back on every page load
  // true from the moment the iframe gets a new key until its onLoad fires
  const [loading, setLoading] = useState(true);
  const done = useCallback(() => setLoading(false), []);
  const reload = () => {
    setLoading(true);
    setNonce((n) => n + 1);
  };
  const other = compareOf(current);
  // Popover with a file's code, placed beside the sidebar at the hovered row's height.
  const [peek, setPeek] = useState<{
    file: string;
    code: string;
    left: number;
    top?: number;
    bottom?: number;
  } | null>(null);
  // A row in the lower half of the window anchors the popover's bottom to the row, so the
  // popover grows upwards and stays on screen.
  const peekAt = (x: { file: string; code: string }, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const low = r.top > window.innerHeight / 2;
    setPeek({ ...x, left: r.right + 8, ...(low ? { bottom: window.innerHeight - r.bottom } : { top: r.top }) });
  };

  return (
    <main className="home">
      {/* NODE_ENV is inlined at build, so the deployed site never ships this banner */}
      {process.env.NODE_ENV === "development" && warn && (
        <div className="dev-warning" role="status">
          <span>
            <T
              t={{
                en: "This is next dev: every route renders on every request, so all modes behave the same here. To see the difference, use next build then next start, or the deployed site.",
                zh: "這是 next dev：每次 request 都會重新產生每個 route 的 HTML，所以不管哪個 mode，reload 之後產生時間都會變。要比較 mode，先跑 next build 再跑 next start，或直接看部署出去的網站。",
              }}
            />
          </span>
          <button
            type="button"
            onClick={() => setWarn(false)}
            aria-label="close"
          >
            close
          </button>
        </div>
      )}
      <SiteHeader at="modes" onLang={reload} />
      <nav className="side">
        {KINDS.map(({ kind, label }) => (
          <section key={kind} className="group" data-kind={kind}>
            <h2>
              <button
                type="button"
                aria-expanded={!shut.has(kind)}
                onClick={() => toggle(kind)}
              >
                {/* the heading is uppercased; keep the symbol out of it, or ƒ turns into F */}
                <span>
                  <span className="sym">{label[0]}</span>
                  {label.slice(1)}
                </span>
                <span aria-hidden>{shut.has(kind) ? "+" : "−"}</span>
              </button>
            </h2>
            {!shut.has(kind) &&
              routes
                .filter((r) => modeKind(r) === kind)
                .map((r) => (
                  <Fragment key={r.href}>
                    <button
                      type="button"
                      className="route"
                      data-kind={kind}
                      aria-pressed={r.href === current.href}
                      onClick={() => {
                        go(r);
                        reload();
                      }}
                    >
                      {r.href}
                      {r.status && (
                        <span className="status"> ({r.status})</span>
                      )}
                    </button>
                    {/* files beside page.tsx (loading.tsx, a client component); hover shows the code */}
                    {(r.hideExtras ? [] : (sourceFor(r.base)?.extras ?? [])).map((x) => (
                      <span
                        key={x.file}
                        className="extra"
                        tabIndex={0}
                        onMouseEnter={(e) => peekAt(x, e.currentTarget)}
                        onFocus={(e) => peekAt(x, e.currentTarget)}
                        onMouseLeave={() => setPeek(null)}
                        onBlur={() => setPeek(null)}
                      >
                        + {x.file.split("/").pop()}
                      </span>
                    ))}
                  </Fragment>
                ))}
          </section>
        ))}
      </nav>
      {peek && (
        <div
          className="peek"
          style={{ top: peek.top, bottom: peek.bottom, left: peek.left, transformOrigin: peek.bottom === undefined ? 'top left' : 'bottom left' }}
          role="tooltip"
        >
          <div className="peek-file">{peek.file}</div>
          {EXTRA_NOTES[peek.file] && (
            <p className="peek-note">
              <T t={EXTRA_NOTES[peek.file]} />
            </p>
          )}
          <pre>
            <code>{peek.code}</code>
          </pre>
        </div>
      )}
      <div className="pane">
        <div className="info">
          <span className="chip" data-kind={modeKind(current)}>
            {current.status ?? modeLabel(current)}
          </span>
          {other && (
            <button
              type="button"
              className="compare"
              onClick={() => {
                go(other);
                setShut((s) => {
                  const n = new Set(s);
                  n.delete(modeKind(other));
                  return n;
                });
                reload();
              }}
            >
              <T t={{ en: "compare with", zh: "對照" }} />{" "}
              <span data-kind={modeKind(other)}>{other.href}</span>
            </button>
          )}
          <span className="tools">
            <button
              type="button"
              className="btn"
              onClick={() => {
                // reload the page the iframe is on, which may be one reached by a link inside it
                setSrc(current.api ? current.href : at);
                reload();
              }}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "loading…" : "reload"}
            </button>
            <a href={current.api ? current.href : at} target="_blank" rel="noreferrer">
              open
            </a>
          </span>
        </div>
        {(current.api || current.status) && (
          <div className="api-note">
            <T t={current.test} />
          </div>
        )}
        {current.api ? (
          <ApiView href={current.href} nonce={nonce} onDone={done} />
        ) : (
          <iframe
            key={`${src}#${nonce}`}
            className="frame"
            src={src}
            title={current.href}
            onLoad={(e) => {
              done();
              // A link inside the page (對照, a table row) moved the iframe: select that route.
              const loc = e.currentTarget.contentWindow?.location;
              if (!loc) return;
              setAt(loc.pathname + loc.search);
              const hit = routes.find((r) => r.href === loc.pathname + loc.search) ?? routes.find((r) => r.href === loc.pathname);
              if (hit && hit.href !== current.href) {
                setCurrent(hit);
                setShut((s) => {
                  const n = new Set(s);
                  n.delete(modeKind(hit));
                  return n;
                });
              }
            }}
          />
        )}
      </div>
    </main>
  );
}
