import type { L } from './i18n'

// One entry per route. `expected` is what the Next 16 docs lead us to expect from
// `next build` (previous caching model, no cacheComponents). `measured` is copied from a
// real `next build` route table; see results/next-16.4.6-build.txt (all 18 matched).
//   ○ Static   prerendered as HTML at build
//   ● SSG      prerendered from generateStaticParams
//   ƒ Dynamic  rendered on demand, per request
// ISR routes are ○ with a Revalidate column in the build output.
// An id outside generateStaticParams gets no symbol: the build table lists `/ssg/[id]` blank
// and only 1, 2, 3 as ●. The docs call it statically rendered "the first time they're
// visited" (node_modules/next/dist/docs/01-app/03-api-reference/04-functions/
// generate-static-params.md, "All paths at runtime"), so those routes are labelled
// "SSG, first visit" with no symbol; see `firstVisit`.
export type Mode = '○' | '●' | 'ƒ'

// Cells are plain strings (a string starting with / becomes a link) or text in both languages.
export type Table = { head: L[]; rows: (string | L)[][] }

export type RouteInfo = {
  href: string // link used by the home page
  base: string // route pattern prefix, for looking up a page's own entry
  factor: L
  test: L // how to see the mode with your own eyes
  try?: string[] // extra URLs worth opening
  api?: boolean // route handler: the iframe shows JSON, so the home page shows the test text
  table?: Table // a comparison table under the test text
  timeline?: { at: string; tone?: 'new' | 'stale' | 'idle'; what: L }[] // drawn as a vertical timeline above the test text
  compare?: string // base of the route to look at next to this one; defaults to diffFrom
  hideExtras?: boolean // the files beside page.tsx are listed under another route of the same folder
  status?: number // expected HTTP status when it is not 200; no Stamp, so the home page shows the test text
  expected: Mode
  revalidate?: number
  diffFrom?: string // base of the route whose page file this one is diffed against
  measured: Mode | null
  firstVisit?: boolean // an id outside generateStaticParams: made at its first request, not at build
  fresh?: string // path prefix; the page offers a link to a random id nobody has opened yet
}

// The three Pages Router fallback modes side by side, each with the page that shows it.
const FALLBACK_TABLE: Table = {
  head: [
    { en: 'Pages Router', zh: 'Pages Router' },
    { en: 'Page', zh: '頁面' },
    { en: 'First visit to an id outside the list', zh: '第一次打開清單外的 id' },
  ],
  rows: [
    ["fallback: false", '/ssg-strict/987654321', { en: '404', zh: '404' }],
    ["fallback: 'blocking'", '/ssg/987654321', { en: 'waits until the page is made, no loading screen', zh: '等頁面產生完才回應，不會出現 loading' }],
    ['fallback: true', '/ssg-fallback/987654321', { en: 'here, even with loading.tsx, the first visit waits 2 s like blocking. Loading first and a stored page for everyone after needs both cacheComponents and partialPrefetching in next.config.ts; see the text above', zh: '這頁就算加了 loading.tsx，第一次打開還是等 2 秒，跟 blocking 一樣。要第一次先出現 loading、之後的人直接拿到存好的頁面，得在 next.config.ts 同時開 cacheComponents 和 partialPrefetching，見上面的說明' }],
  ],
}

// Ids outside generateStaticParams in /ssg-fallback/[id]. The folder has a loading.tsx, but in
// production (next start and the Cloudflare Worker) the first request waits for the whole page
// and loading.tsx is never painted, on a full load or a client navigation; measured for Gin G2,
// see attack-fightback-2026-11-22T043142Z.md and bench/. Only next dev streams it first.
// The same file and the same text for all of them; loading.tsx is listed under 987654321 only.
// Not in the build table, so nothing to copy as measured.
function fallbackUnlisted(id: string): RouteInfo {
  return {
    href: `/ssg-fallback/${id}`, base: `/ssg-fallback/${id}`, diffFrom: '/ssg', compare: '/ssg-fallback/1', hideExtras: id !== '987654321', expected: '●', measured: null, firstVisit: true, fresh: '/ssg-fallback/',
    factor: { en: `/ssg/[id] plus loading.tsx, id ${id}.`, zh: `/ssg/[id] 加上 loading.tsx，id 是 ${id}。` },
    test: {
      en: 'First visit to an id: 2 s with nothing new on screen, then the page. After that the stored page comes back at once and the time does not change.\nThis folder has a loading.tsx, yet the deployed site never shows it: the server answers the first request only when the whole page is done, the same as /ssg/987654321. A link inside the site does not change that. Only next dev shows loading first.\nNo 2 s wait means someone opened this id before you. To see the wait yourself, use the link below: it goes to a random id nobody has opened.\n\nThe Pages Router\'s fallback: true means loading first on the first visit, then the finished page is stored for everyone after. The App Router gets both only with cacheComponents and partialPrefetching together in next.config.ts: cacheComponents stores the finished page, and partialPrefetching makes the server send the <Suspense> fallback (the loading screen) first. With cacheComponents alone, the result matches the Pages Router\'s fallback: \'blocking\'. This site turns on neither (it uses the previous caching model), so the first visit can only wait 2 s.\nA separate test build with both flags, run with next start, shows loading at 0.03 s and the page at 2.79 s on the first visit (its 2 s wait is a fetch to httpbin, so the round trip is in there too), and the stored page at 0.01 s on the second. Deployed to Cloudflare, though, loading on the first visit arrives only after about 1 s, and the second visit flashes loading and then shows "This page couldn’t load". The error message is "This promise was created by a request that has since ended". It could come from Next.js, from OpenNext (the adapter that runs Next.js on Cloudflare) or from the Workers runtime itself; which one is not known yet.',
      zh: '第一次打開這個 id：畫面停 2 秒沒有變化，接著整頁出現。之後再 reload，server 直接回存好的頁面，時間不會再變。\n這個資料夾有 loading.tsx，但部署出去的網站不會顯示它：server 等整頁做完才回應第一個請求，跟 /ssg/987654321 一樣。從站內連結點進來也一樣。只有 next dev 會先出現 loading。\n如果沒有等那 2 秒，代表在你之前已經有人打開過這個 id。想自己看到那 2 秒，就點下面的連結，換到一個還沒人打開過的隨機 id。\n\nPages Router 的 fallback: true 是第一次打開先出現 loading，頁面做完之後存起來給之後的人用。App Router 要兩件事都有，得在 next.config.ts 同時開 cacheComponents 和 partialPrefetching。cacheComponents 讓做好的頁面存起來；partialPrefetching 讓 server 先把 <Suspense> 的 fallback，也就是 loading，送出去。如果只開 cacheComponents，效果等同 Pages Router 的 fallback: \'blocking\'。這個網站兩個都沒開，用的是舊的快取模式，所以第一次打開只能等 2 秒。\n我用這兩個設定另外做了一個測試版。用 next start 跑的時候，第一次打開 0.03 秒就出現 loading，2.79 秒出現頁面。這 2.79 秒裡，有 2 秒是在等 httpbin 回應，剩下的包括連到 httpbin 來回的網路時間。第二次打開 0.01 秒，server 直接回存好的頁面。但部署到 Cloudflare 之後，第一次打開要 1 秒多 loading 才出現；第二次打開會先閃一下 loading，接著顯示「This page couldn’t load」。錯誤訊息是 This promise was created by a request that has since ended。它可能來自 Next.js、來自 OpenNext（讓 Next.js 跑在 Cloudflare 上的 adapter），也可能是 Workers 執行環境本身的限制，目前還不知道是哪一個。',
    },
    table: FALLBACK_TABLE,
  }
}

export const ROUTES: RouteInfo[] = [
  {
    href: '/static', base: '/static', expected: '○', measured: '○',
    factor: { en: 'Nothing request-specific: no params, no cookies, no fetch.', zh: '頁面裡沒有任何跟請求有關的東西：沒有參數、沒有 cookie、沒有 fetch。' },
    test: {
      en: 'Press reload a few times. The time stays at the moment of next build and the age keeps growing, because this HTML was made once and is served as a file.',
      zh: '按幾次 reload，時間都停在 next build 那一刻，mode 旁邊的秒數一直往上加。這份 HTML 只在 build 時產生一次，之後都直接當檔案回。',
    },
  },
  {
    href: '/use-client', base: '/use-client', diffFrom: '/static', expected: '○', measured: '○',
    factor: { en: 'Same as /static, but the page file starts with "use client".', zh: '跟 /static 一樣，只是頁面檔案開頭加了 "use client"。' },
    test: {
      en: 'Same result as /static: the time stays at build. "use client" means the component also runs in the browser after hydration; the HTML is still made at build.',
      zh: '結果跟 /static 一樣，時間停在 build。"use client" 只代表這個元件在 hydration 之後也會在瀏覽器裡執行，不過它的 HTML 一樣在 build 時就做好了。',
    },
  },
  {
    href: '/ssg/1', base: '/ssg', expected: '●', measured: '●', try: ['/ssg/2', '/ssg/3'],
    factor: { en: 'Dynamic segment with generateStaticParams returning 1, 2, 3.', zh: 'dynamic route，generateStaticParams 回傳 1、2、3。' },
    test: {
      en: '1, 2 and 3 are in the list, so all three were made at build ({rendered}).\n→ Reload any of them and the time does not change.\n\nAn id outside the list: see /ssg/987654321.',
      zh: '1、2、3 在清單裡，三頁都在 build 時產生（{rendered}）。\n→ 不管 reload 哪一頁，時間都不會變。\n\n不在清單裡的 id：看 /ssg/987654321。',
    },
  },
  {
    // Same file as /ssg/[id]; the build table lists only the pattern, so nothing to copy as measured.
    href: '/ssg/987654321', base: '/ssg/987654321', compare: '/ssg', expected: '●', measured: null, firstVisit: true, fresh: '/ssg/',
    factor: { en: '/ssg/[id] with id 987654321, which generateStaticParams does not return.', zh: '跟 /ssg/1 是同一個 /ssg/[id] 檔案，只是 id 換成 987654321，而 generateStaticParams 回傳的清單裡沒有 987654321。' },
    test: {
      en: 'Not made at build. dynamicParams defaults to true, which means an id outside the list is rendered when its first request arrives, then kept. This copy was made at {rendered}; if nobody opened it before you, that was your visit.\n→ Reload and the time does not change.\nA time earlier than the visit means someone opened this id before. To be the first to open one, use the link below: it goes to a random id nobody has opened.\n\nThe Pages Router\'s fallback: \'blocking\'.',
      zh: 'build 時沒有產生。dynamicParams 預設是 true，意思是清單外的 id 等到第一個請求進來才產生，產生完就存起來。這一份的產生時間是 {rendered}，如果在你之前沒人打開過，那就是你剛剛打開的時間。\n→ 之後再 reload，時間都不會再變。\n如果產生時間比打開的時間早，代表之前已經有人打開過這個 id。想當第一個打開的人，就點下面的連結，換到一個還沒人打開過的隨機 id。\n\n等於 Pages Router 的 fallback: \'blocking\'。',
    },
  },
  {
    // Listed in generateStaticParams, so it is complete HTML from build and loading.tsx never shows.
    href: '/ssg-fallback/1', base: '/ssg-fallback', diffFrom: '/ssg', compare: '/ssg-fallback/987654321', hideExtras: true, expected: '●', measured: null,
    factor: { en: '/ssg/[id] plus loading.tsx, id 1.', zh: '/ssg/[id] 加上 loading.tsx，id 是 1。' },
    test: {
      en: 'This page has nothing to do with fallback. fallback only decides what happens to ids outside generateStaticParams, and 1 is in the list.\n1 was made at build: no loading screen, and the time stays at build. With fallback false, \'blocking\' or true, the result is the same.',
      zh: '這頁跟 fallback 無關。fallback 只決定 generateStaticParams 清單外的 id 怎麼處理，而 1 在清單裡。\n1 在 build 時就做好了，所以打開不會出現 loading，時間停在 build。不管 fallback 設 false、\'blocking\' 還是 true，結果都一樣。',
    },
  },
  fallbackUnlisted('987654321'),
  fallbackUnlisted('100'),
  {
    href: '/ssg-strict/1', base: '/ssg-strict', diffFrom: '/ssg', expected: '●', measured: '●', try: ['/ssg-strict/2', '/ssg-strict/3'],
    factor: { en: 'Like /ssg/[id], plus dynamicParams = false.', zh: '跟 /ssg/[id] 一樣，再加上 dynamicParams = false。' },
    test: {
      en: 'This route makes no pages on demand: only the ids from generateStaticParams open.\n1, 2, 3: made at build, the time never changes.\nAny other id: 404, see /ssg-strict/987654321.\n\n/ssg/987654321 gets made on first visit; /ssg-strict/987654321 does not. The one line that differs is dynamicParams = false.',
      zh: 'dynamicParams = false 代表 generateStaticParams 名單沒有的不准 render。\n1、2、3：build 時產生，時間不會變。\n其他 id：404，看 /ssg-strict/987654321。\n\n/ssg/987654321 第一次打開時會產生，/ssg-strict/987654321 不會。兩個檔案只差 dynamicParams = false 這一行。',
    },
  },
  {
    // A 404 page has no Stamp, so the home page shows the test text above the iframe.
    href: '/ssg-strict/987654321', base: '/ssg-strict/987654321', compare: '/ssg/987654321', expected: '●', measured: null, status: 404,
    factor: { en: '/ssg-strict/[id] with id 987654321, outside the list.', zh: '/ssg-strict/[id] 的 id 換成 987654321，不在清單裡。' },
    test: {
      en: 'Because dynamicParams = false, an id outside the list never gets a page, even when someone opens it: the answer is 404. The Pages Router\'s fallback: false. The same id under /ssg/987654321 does get a page.',
      zh: '因為 dynamicParams = false，清單外的 id 有人打開也不會產生頁面，直接回 404。等於 Pages Router 的 fallback: false。同樣的 id 換到 /ssg/987654321 就會產生。',
    },
  },
  {
    href: '/dynamic-segment/1', base: '/dynamic-segment', diffFrom: '/ssg', expected: 'ƒ', measured: 'ƒ', try: ['/dynamic-segment/2'],
    factor: { en: 'Dynamic segment without generateStaticParams.', zh: 'dynamic route，沒有 generateStaticParams。' },
    test: {
      en: 'New every time.',
      zh: '每次都是新的',
    },
  },
  {
    href: '/force-dynamic', base: '/force-dynamic', diffFrom: '/static', expected: 'ƒ', measured: 'ƒ',
    factor: { en: "Same as /static, plus export const dynamic = 'force-dynamic'.", zh: "跟 /static 一樣，再加上 export const dynamic = 'force-dynamic'。" },
    test: {
      en: 'New every time. This page could be made at build; force-dynamic makes it render on every request instead.',
      zh: '每次都是新的。這頁本來可以 build 時就做好，force-dynamic 硬把它改成每次 request 都重新產生。',
    },
  },
  {
    // Not in results/next-16.4.6-build-2026-11-22.txt (added after that build), so not measured yet.
    href: '/force-dynamic-loading', base: '/force-dynamic-loading', diffFrom: '/force-dynamic', compare: '/ssg-fallback/987654321', expected: 'ƒ', measured: null,
    factor: { en: '/force-dynamic plus a 2 s wait and loading.tsx.', zh: '/force-dynamic 加上等 2 秒跟 loading.tsx。' },
    test: {
      en: 'Every visit: the loading screen first, replaced by the page 2 s later. On the deployed site the loading screen arrives at 0.4 s and the page at 2.3 s.\nCompare /ssg-fallback/987654321: the same loading.tsx and the same 2 s wait. The difference is that that page is stored after its first visit for everyone after, while this one is made again on every request and never stored. On its first visit the server waits 2 s and sends the whole page at once, with no loading screen.',
      zh: '每次打開：先出現 loading 畫面，2 秒後 loading 換成頁面。在部署出去的網站上，loading 0.4 秒就送到，頁面 2.3 秒才送到。\n對照 /ssg-fallback/987654321：loading.tsx 一樣，也一樣等 2 秒。不過那頁第一次打開之後會存起來給之後的人用，這頁每次都當場重做、不存。那頁第一次打開時，server 等 2 秒後才把整頁一起送出，不會出現 loading。',
    },
  },
  {
    href: '/force-static-cookies', base: '/force-static-cookies', diffFrom: '/cookies', expected: '○', measured: '○',
    factor: { en: "Reads cookies(), plus export const dynamic = 'force-static'.", zh: "讀了 cookies()，再加上 export const dynamic = 'force-static'。" },
    test: {
      en: "force-static renders this page at build. There is no request at build, so there is no Cookie header: cookies() reads nothing and 'cookies seen' is always 0. Everyone gets that copy afterwards.",
      zh: 'force-static 讓這頁在 build 時 render。build 時沒有 request，也就沒有 Cookie header，所以 cookies() 讀到空的，cookies seen 永遠是 0。之後每個人拿到的都是這一份。',
    },
  },
  {
    href: '/cookies', base: '/cookies', diffFrom: '/static', compare: '/force-static-cookies', expected: 'ƒ', measured: 'ƒ',
    factor: { en: 'Reads cookies().', zh: '讀了 cookies()。' },
    test: {
      en: "New every time. The browser puts its cookies in the Cookie header of every request, and cookies() reads that header on the server. So this page can only render once a request arrives. 'cookies seen' counts the cookies in that header.",
      zh: '每次都是新的。瀏覽器每次 request 都會把 cookie 放進 Cookie header，server 執行 cookies() 時讀這個 header，所以這頁要等 request 進來才能 render。cookies seen 算的是這個 header 裡有幾個 cookie。',
    },
  },
  {
    href: '/search-params?q=hi', base: '/search-params', diffFrom: '/static', expected: 'ƒ', measured: 'ƒ', try: ['/search-params?q=bye'],
    factor: { en: 'Reads searchParams.', zh: '讀了 searchParams。' },
    test: {
      en: 'New every time; change ?q= and the page changes with it.',
      zh: '每次都是新的，改 ?q= 頁面跟著變',
    },
  },
  {
    href: '/connection', base: '/connection', diffFrom: '/static', expected: 'ƒ', measured: 'ƒ',
    factor: { en: 'Calls await connection().', zh: '呼叫了 await connection()。' },
    test: {
      en: 'New every time.',
      zh: '每次都是新的',
    },
  },
  {
    href: '/fetch-default', base: '/fetch-default', diffFrom: '/static', expected: '○', measured: '○',
    factor: { en: 'fetch() with no cache option.', zh: 'fetch() 沒有設定 cache。' },
    test: {
      en: 'Time and uuid stay at build. fetch is not cached by default since Next 15, but nothing in this page needs the request, so the whole page, fetch result included, is made once at build.',
      zh: '時間跟 uuid 都停在 build。Next 15 之後 fetch 預設不快取，可是這頁沒有東西需要用到請求，所以整頁連同 fetch 的結果，都在 build 時做一次就好。',
    },
  },
  {
    href: '/fetch-no-store', base: '/fetch-no-store', diffFrom: '/fetch-default', expected: 'ƒ', measured: 'ƒ',
    factor: { en: "fetch() with cache: 'no-store'.", zh: "fetch() 設定 cache: 'no-store'。" },
    test: {
      en: 'New every time, uuid included.',
      zh: '每次都是新的，uuid 也是',
    },
  },
  {
    href: '/fetch-force-cache', base: '/fetch-force-cache', diffFrom: '/fetch-default', expected: '○', measured: '○',
    factor: { en: "fetch() with cache: 'force-cache'.", zh: "fetch() 設定 cache: 'force-cache'。" },
    test: {
      en: 'Time and uuid stay at build. The response goes into the data cache and the page is static.',
      zh: "時間跟 uuid 都停在 build。cache: 'force-cache' 讓這次 fetch 的回應存進 Next 的資料快取（data cache），因為資料可以重用，整頁也就在 build 時產生一次。",
    },
  },
  {
    href: '/isr', base: '/isr', diffFrom: '/static', expected: '○', measured: '○', revalidate: 30,
    factor: { en: 'Same as /static, plus export const revalidate = 30.', zh: '跟 /static 一樣，再加上 export const revalidate = 30。' },
    test: {
      en: 'No reload, no rebuild. The request that triggers it does not wait: stale-while-revalidate.',
      zh: '沒人 reload 就不會重新產生。觸發的那次 request 不用等新頁面，這叫 stale-while-revalidate。',
    },
    // t is when this copy was made; 45s stands for "any moment after 30s".
    timeline: [
      { at: 't', tone: 'new', what: { en: 'Page made. Time shown: t.', zh: '頁面產生，顯示時間 t。' } },
      { at: 't+0–30s', what: { en: 'Reload: same page, still t.', zh: 'reload：同一份，還是 t。' } },
      { at: 't+30s', tone: 'idle', what: { en: 'Expired. Until the next request arrives, the server does not remake the page.', zh: '過期。在下一個 request 進來之前，server 不會重新產生頁面。' } },
      { at: 't+45s', tone: 'stale', what: { en: '1st reload: the server returns the old page (t) and remakes one in the background.', zh: '第 1 次 reload：server 先回舊頁面（t），同時在背景重新產生一份。' } },
      { at: 't+46s', tone: 'new', what: { en: '2nd reload: the new page, timed t+45s, the moment the 1st reload triggered the rebuild.', zh: '第 2 次 reload：拿到新頁面，時間是 t+45s，也就是第 1 次 reload 觸發重新產生的那一刻。' } },
      { at: 't+75s', tone: 'idle', what: { en: 'Expired again; back to the t+30s row.', zh: '又過期，回到 t+30s 那一列。' } },
    ],
  },
  {
    href: '/fetch-revalidate', base: '/fetch-revalidate', diffFrom: '/fetch-default', expected: '○', measured: '○', revalidate: 30,
    factor: { en: 'fetch() with next: { revalidate: 30 }.', zh: 'fetch() 設定 next: { revalidate: 30 }。' },
    test: {
      en: 'Behaves like /isr, and the uuid changes together with the time. The route takes the shortest revalidate among its fetches.',
      zh: '跟 /isr 一樣，uuid 會跟時間一起換。整個 route 會採用裡面所有 fetch 最短的 revalidate。',
    },
  },
  {
    href: '/isr-on-demand', base: '/isr-on-demand', diffFrom: '/static', expected: '○', measured: '○',
    factor: { en: "Static until revalidatePath('/isr-on-demand') is called.", zh: "靜態頁，直到有人呼叫 revalidatePath('/isr-on-demand')。" },
    test: {
      en: 'Reload as often as you like: the time stays. Press revalidatePath below, then reload: the time changes once and stays again until the next press.',
      zh: '怎麼 reload 時間都不變。按下面的 revalidatePath，再 reload：時間換一次，然後又停住，直到下次再按。',
    },
  },
  {
    href: '/api/get', base: '/api/get', expected: 'ƒ', measured: 'ƒ', api: true,
    factor: { en: 'GET route handler, no config.', zh: 'GET route handler，沒有任何設定。' },
    test: {
      en: 'renderedAt changes on every reload. GET handlers are not cached by default since Next 15.',
      zh: '每次 reload，renderedAt 都不一樣。Next 15 之後 GET handler 預設不快取。',
    },
  },
  {
    href: '/api/get-force-static', base: '/api/get-force-static', expected: '○', measured: '○', api: true,
    factor: { en: "GET route handler with dynamic = 'force-static'.", zh: "GET route handler，設定 dynamic = 'force-static'。" },
    test: {
      en: 'renderedAt stays at build: force-static turns the handler output into a file at build.',
      zh: 'renderedAt 停在 build：force-static 讓 handler 的輸出在 build 時就變成一個檔案。',
    },
  },
]

export const MODE_NAME: Record<Mode, string> = { '○': 'Static', '●': 'SSG', 'ƒ': 'Dynamic (SSR)' }

export function modeLabel(r: RouteInfo) {
  if (r.firstVisit) return 'SSG, first visit'
  const m = r.measured ?? r.expected
  const isr = r.revalidate ? `, ISR ${r.revalidate}s` : ''
  return `${m} ${MODE_NAME[m]}${isr}`
}

// Colour group for the sidebar and the stamp. ISR is a ○ in the build table, but it
// behaves differently enough (the time moves) to get its own colour.
export type Kind = 'static' | 'ssg' | 'isr' | 'dynamic'
export const KINDS: { kind: Kind; label: string }[] = [
  { kind: 'static', label: '○ Static' },
  { kind: 'ssg', label: '● SSG' },
  { kind: 'isr', label: '○ ISR' },
  { kind: 'dynamic', label: 'ƒ Dynamic (SSR)' },
]
export function modeKind(r: RouteInfo): Kind {
  if (r.revalidate || r.base === '/isr-on-demand') return 'isr'
  const m = r.measured ?? r.expected
  return m === '●' ? 'ssg' : m === 'ƒ' ? 'dynamic' : 'static'
}

export function findRoute(path: string) {
  const exact = ROUTES.find((r) => r.href === path)
  if (exact) return exact
  // A random id from FreshLink (always >= 1000, so never 1, 2, 3) gets the text of the
  // unlisted-id entry, not the prefix match on /ssg-fallback, which is the listed id 1.
  const fresh = ROUTES.find((r) => r.fresh && path.startsWith(r.fresh) && Number(path.slice(r.fresh.length)) >= 1000)
  if (fresh) return fresh
  return ROUTES.filter((r) => path === r.base || path.startsWith(`${r.base}/`)).sort((a, b) => b.base.length - a.base.length)[0]
}

// The route to compare with: same file minus one line (diffFrom), or an explicit pair.
export function compareOf(r: RouteInfo) {
  const base = r.compare ?? r.diffFrom
  return base ? ROUTES.find((x) => x.base === base) : undefined
}
