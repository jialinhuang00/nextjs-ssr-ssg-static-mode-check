# Next.js rendering modes explorer

Which line of code makes a Next.js page Static, SSG, ISR or Dynamic? Each route here changes one thing, and the page shows what that changed.

- Site: https://nextmode.jialin00.com
- Cache Components version of one route: https://cc.nextmode.jialin00.com/987654321

Next.js 16.4.6, App Router, deployed to Cloudflare Workers with OpenNext.

## What each page shows

Every page prints the time it was rendered. Reload and watch the time:

| Time on reload | The page is |
| --- | --- |
| stays the same | ○ Static or ● SSG, made at build (or at the first visit to that id) |
| changes after N seconds | ISR |
| changes every time | ƒ Dynamic, rendered per request |

The home page lists every route with its page source, the diff against a neighbouring route, and what to do to see the difference (reload, add a cookie, change `?q=`).

| Group | Routes |
| --- | --- |
| No request data | `/static`, `/use-client` |
| `generateStaticParams` | `/ssg/[id]`, `/ssg-fallback/[id]`, `/ssg-strict/[id]`, `/dynamic-segment/[id]` |
| `export const dynamic` | `/force-dynamic`, `/force-dynamic-loading`, `/force-static-cookies` |
| Request-time APIs | `/cookies`, `/search-params`, `/connection` |
| `fetch` options | `/fetch-default`, `/fetch-force-cache`, `/fetch-no-store`, `/fetch-revalidate`, `/connection-fetch` |
| ISR | `/isr`, `/isr-on-demand` |
| Route handlers | `/api/get`, `/api/get-force-static`, `/api/post` |

`/rsc` explains Server and Client Components. `/about` lists the pages by mode.

## Two apps

| | Root | `cc/` |
| --- | --- | --- |
| Caching model | previous (no `cacheComponents`) | `cacheComponents` + `partialPrefetching` |
| Why | `dynamic`, `revalidate`, `dynamicParams` only work here | the only way to get the fallback first for an unlisted id |
| Routes | all of the above | `/[id]` |
| Worker | `nextjs-modes` | `nextjs-modes-cc` |
| Domain | nextmode.jialin00.com | cc.nextmode.jialin00.com |

Known problem in `cc/` on Workers: the second visit to an id outside `generateStaticParams` returns only the fallback. The same code run locally with `next start` serves the stored page on the second visit. Both are in `results/cc-stream-timing-2026-11-24.txt`.

## Run

```bash
pnpm install
pnpm dev        # next dev
pnpm build      # next build, prints the route table
pnpm start      # next start, production behaviour locally
pnpm run deploy # OpenNext build + deploy to Cloudflare Workers
```

`cc/` has its own `package.json` and lockfile; run the same commands inside it (dev on 3101, start on 3201).

`next dev` renders every page on every request, so Static, SSG and ISR all look Dynamic there. Check modes with `pnpm build` + `pnpm start`, or on the deployed site.

## How the claims are checked

| Claim | Check | Saved in |
| --- | --- | --- |
| A route is ○ / ● / ƒ | the route table printed by `next build` | `results/next-16.4.6-build-*.txt` |
| A fallback is streamed before the page | `python3 -I bench/stream-timing.py <origin> [prefix]`: arrival time of each chunk, first and second visit to a fresh id | `results/cc-stream-timing-*.txt` |
| An ISR page is replaced after its 30 s | `python3 -I bench/isr-probe.py <origin> <path> <seconds...>`: rendered time and `x-nextjs-cache` of a request at each offset | `results/isr-probe-*.txt` |
| What the browser paints | `bench/browser-probes.js`, pasted into DevTools on the deployed site | |
| Cookies, `?q=`, fetch caching | the buttons and the uuid table on each page | |

In `src/app/routes.ts`, `expected` is what the docs say and `measured` is copied from a saved build table. `measured: null` means no saved table covers that route yet.

## Layout

| Path | What |
| --- | --- |
| `src/app/<route>/page.tsx` | one route, one change |
| `src/app/routes.ts` | every route's text (EN / 中文), expected and measured mode |
| `src/app/stamp.tsx` | the frame each page renders: time, mode, source, diff |
| `scripts/gen-sources.mjs` | copies each page's source into `sources.generated.ts` before dev and build |
| `open-next.config.ts`, `wrangler.jsonc` | R2 incremental cache, Durable Object queue and tag cache (needed for ISR) |
| `bench/`, `results/` | measurement scripts and their saved output |
| `cc/` | the Cache Components app |

## Inspiration

https://www.youtube.com/watch?v=E1HzFvXgrCs&ab_channel=DaveGray
