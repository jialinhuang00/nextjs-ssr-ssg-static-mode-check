@AGENTS.md

# Project

A site that shows which line of code makes a Next.js 16 page Static, SSG, ISR or Dynamic. One route per change. README.md has the route list, the two apps (root and `cc/`) and the commands.

## Commands

- Do not run `pnpm build` or `next build` while a dev server is running: it wipes `.next/`. A hook blocks it. The dev server is usually on port 3100; check there with curl.
- `pnpm run deploy` (root) and `pnpm run deploy` inside `cc/` deploy two separate Workers. Deploy only when asked.
- `cc/` is its own app with its own lockfile and `node_modules`. Read Next docs from the `node_modules` of the app being changed.

## Adding or changing a route

1. `src/app/<route>/page.tsx`: change one thing compared with the route it is diffed against (`diffFrom`).
2. `src/app/routes.ts`: add the entry, text in both `en` and `zh`. `measured` stays `null` until a build table that covers the route is saved in `results/`.
3. `src/app/about/page.tsx`: add the route to its mode list.
4. A file beside `page.tsx` (client component, `loading.tsx`): add its note to `src/app/extra-notes.ts`.

`src/app/sources.generated.ts` is written by `scripts/gen-sources.mjs`. Do not edit it.

## Page text

- Short. State what the reader sees on reload and the one reason. No log of how it was measured.
- A comparison goes in a `table`, or one result per line. Not in a sentence.
- Label environments `dev` and `prod`.
- Links use `[words](href)`.
- Data to compare (uuids, counts) goes in a table under the text, not in the top row of the frame.
- `zh` text: technical terms stay in English.

## Claims

- Do not write that a page behaves some way without measuring it. `next dev` renders every request, so it cannot show Static, SSG or ISR; measure on `next start` or the deployed site.
- Mode symbols come from the `next build` route table. Streaming claims come from `bench/stream-timing.py`. Save output in `results/` with the date.
- If dev and prod differ, say both.
- In `cc/` on Workers the second visit to an unlisted id fails. The cause is not established; do not name one in page text.
