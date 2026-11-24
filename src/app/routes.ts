import type { L } from './i18n'

// One entry per route. `expected` is what the Next 16 docs lead us to expect from
// `next build` (previous caching model, no cacheComponents). `measured` is copied from a
// real `next build` route table; see results/next-16.4.6-build.txt (all 18 matched).
// Routes added after that build have `measured: null` until the next build table is saved.
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
    ['fallback: true', '/ssg-fallback/987654321', { en: 'on the deployed site: waits 2 s like blocking, loading.tsx never shows', zh: '部署出去的網站上等 2 秒，跟 blocking 一樣，loading.tsx 不會出現' }],
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
      en: "First visit to this id: the screen waits 2 s, then the whole page appears. After that a reload gets the stored page and the time does not change. No 2 s wait means someone opened this id before; 'open a new id' below goes to one nobody has opened.\n\nThis folder has a loading.tsx, which is the App Router's way to write the Pages Router's fallback: true, so by design loading shows first. What the first visit to an id outside generateStaticParams really does:\n· dev → loading first, replaced by the page 2 s later\n· prod →no loading; the whole page arrives after 2 s, like fallback: 'blocking' ([/ssg/987654321](/ssg/987654321))\n\nLoading first on the first visit needs cacheComponents and partialPrefetching in next.config.ts. A build with both turned on is deployed at [cc.nextmode.jialin00.com](https://cc.nextmode.jialin00.com/" + id + "), to compare with this page.",
      zh: "第一次打開這個 id，畫面會停 2 秒，接著整頁出現。之後再 reload，server 直接回存好的頁面，時間不會再變。如果沒有等那 2 秒，代表已經有人打開過這個 id，點下面的「打開一個新的 id」可以換一個還沒人打開過的。\n\n這個資料夾有 loading.tsx，在 App Router 裡這是 Pages Router fallback: true 的寫法，照設計會先出現 loading。第一次打開 generateStaticParams 清單外的 id，實際的結果是：\n· dev → 先出現 loading，2 秒後換成頁面\n· prod →沒有 loading，等 2 秒後整頁一起出現，跟 fallback: 'blocking'（[/ssg/987654321](/ssg/987654321)）一樣\n\n如果要第一次打開就先出現 loading，next.config.ts 得開 cacheComponents 跟 partialPrefetching。開了這兩個設定的版本部署在 [cc.nextmode.jialin00.com](https://cc.nextmode.jialin00.com/" + id + ")，可以打開來跟這頁比較。",
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
      en: "The time changes on every reload.\nWithout export const dynamic = 'force-dynamic', this page would be Static.",
      zh: "每次 reload，時間都會換。\n不加上 export const dynamic = 'force-dynamic'，他就會歸類在 static。",
    },
  },
  {
    // Not in results/next-16.4.6-build-2026-11-22.txt (added after that build), so not measured yet.
    href: '/force-dynamic-loading', base: '/force-dynamic-loading', diffFrom: '/force-dynamic', compare: '/ssg-fallback/987654321', expected: 'ƒ', measured: null,
    factor: { en: '/force-dynamic plus a 2 s wait and loading.tsx.', zh: '/force-dynamic 加上等 2 秒跟 loading.tsx。' },
    test: {
      en: 'Every visit shows loading first, replaced by the page 2 s later.\n/ssg-fallback/987654321 also has a loading.tsx and a 2 s wait, but on prod its first visit does not show loading first. The table has the first visit of both pages.',
      zh: '每次打開都先出現 loading，2 秒後換成頁面。\n/ssg-fallback/987654321 也有 loading.tsx、也要等 2 秒，但它在 prod 第一次打開時不會先出現 loading。下表是兩頁第一次打開的結果。',
    },
    table: {
      head: [
        { en: 'Page', zh: '頁面' },
        { en: 'First visit, dev', zh: 'dev 第一次打開' },
        { en: 'First visit, prod', zh: 'prod 第一次打開' },
        { en: 'Page stored afterwards', zh: '頁面之後會不會存起來' },
      ],
      rows: [
        ['/ssg-fallback/987654321', { en: 'loading', zh: '有 loading' }, { en: 'no loading', zh: '沒有 loading' }, { en: 'yes', zh: '會' }],
        ['/force-dynamic-loading', { en: 'loading', zh: '有 loading' }, { en: 'loading', zh: '有 loading' }, { en: 'no, rendered again on every request', zh: '不會，每次 request 都重新 render' }],
      ],
    },
  },
  {
    href: '/force-static-cookies', base: '/force-static-cookies', diffFrom: '/cookies', expected: '○', measured: '○',
    factor: { en: "Reads cookies(), plus export const dynamic = 'force-static'.", zh: "讀了 cookies()，再加上 export const dynamic = 'force-static'。" },
    test: {
      en: "force-static renders this page at build. There is no request at build, so there is no Cookie header: cookies() returns an empty list and the HTML is written with 'cookies seen: 0'.\nPress the button below: the browser stores one more cookie and reloads. The count here stays 0, because the server answers with the HTML made at build and does not run cookies() again. Open /cookies after that: the browser sends the new cookie along, and the count on that page goes up by 1.",
      zh: 'force-static 讓這頁在 build 時 render。build 時沒有 request，也就沒有 Cookie header，所以 cookies() 拿到的是空的，HTML 裡寫的就是 cookies seen: 0。\n按下面的按鈕，瀏覽器會多存一個 cookie 再 reload。這頁的數字還是 0，因為 server 回的是 build 時做好的那份 HTML，沒有再執行一次 cookies()。這時候再打開 /cookies，瀏覽器會把剛存的 cookie 一起送過去，那頁的 cookies seen 就會多 1。',
    },
  },
  {
    href: '/cookies', base: '/cookies', diffFrom: '/static', compare: '/force-static-cookies', expected: 'ƒ', measured: 'ƒ',
    factor: { en: 'Reads cookies().', zh: '讀了 cookies()。' },
    test: {
      en: "New every time. The browser puts its cookies in the Cookie header of every request, and cookies() reads that header on the server. So this page can only render once a request arrives. 'cookies seen' counts the cookies in that header.\nPress the button below: the browser stores a cookie named demo-… with document.cookie and reloads, and the count goes up by 1. /force-static-cookies has the same button, and there the count stays 0.",
      zh: '每次都是新的。瀏覽器每次 request 都會把 cookie 放進 Cookie header，server 執行 cookies() 時讀這個 header，所以這頁要等 request 進來才能 render。cookies seen 算的是這個 header 裡有幾個 cookie。\n按下面的按鈕，瀏覽器會用 document.cookie 存一個 demo- 開頭的 cookie 再 reload，cookies seen 就多 1。/force-static-cookies 有同一顆按鈕，但那邊的數字會停在 0。',
    },
  },
  {
    href: '/search-params?q=hi', base: '/search-params', diffFrom: '/static', expected: 'ƒ', measured: 'ƒ', try: ['/search-params?q=bye'],
    factor: { en: 'Reads searchParams.', zh: '讀了 searchParams。' },
    test: {
      en: "The time changes on every reload, even when ?q= stays the same.\nThis page reads searchParams and shows the value of ?q= under 'data'. That value is only known once a request arrives, and at build there is no URL to read, so this page is ƒ Dynamic and renders again on every request.",
      zh: '每次 reload，時間都會換，就算 ?q= 沒改也一樣。\n這頁讀了 searchParams，把 ?q= 的值顯示在「資料」那一欄。?q= 的值要等 request 進來才知道，build 時沒有 URL 可以讀，所以這頁是 ƒ Dynamic，每次 request 都重新 render。',
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
      en: "Time and uuid stay at build. fetch is not cached by default since Next 15, but this page uses no API that needs a request (such as cookies()), so it is still Static: the fetch ran once, in Node.js, during next build, and its result is written into the HTML.\nfetch() is the Web API, built into Node.js, so there is no import. On the server Next adds two options to it: cache and next.revalidate.\nAdding cache: 'force-cache' gives the same result: see /fetch-force-cache.",
      zh: "時間跟 uuid 都停在 build。Next 15 之後 fetch 預設不快取，但這頁沒有用到 cookies() 這類要等 request 的 API，所以還是 Static：fetch 只在 next build 時由 Node.js 執行一次，結果寫進 HTML。\nfetch() 是 Web API。Node.js 本身就內建 fetch()，所以 page.tsx 不用 import 它。Next 在 server 上替它加了 cache 跟 next.revalidate 這兩個 option。\n加上 cache: 'force-cache' 結果也一樣，見 /fetch-force-cache。",
    },
  },
  {
    // Added after results/next-16.4.6-build-2026-11-22.txt, so not in a build table yet. The
    // uuid behaviour was checked on next dev only (2026-11-24, three requests in a row).
    href: '/connection-fetch', base: '/connection-fetch', diffFrom: '/connection', compare: '/fetch-force-cache', expected: 'ƒ', measured: null,
    factor: { en: "/connection plus two fetches: one with no cache option, one with cache: 'force-cache'.", zh: "/connection 加上兩個 fetch：一個沒有設定 cache，一個設定 cache: 'force-cache'。" },
    test: {
      en: 'connection() makes this page render on every request, so both fetches run every time. Press reload: the table lists the uuid each fetch got on the previous load and on this one.',
      zh: 'connection() 讓這頁每次 request 都重新 render，所以兩個 fetch 每次都會執行。按 reload，下表會列出兩個 fetch 上一次跟這一次拿到的 uuid。',
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
      en: "Time and uuid stay at build, the same as /fetch-default. This page is Static and never renders again after build, so the result is the same with or without cache: 'force-cache'.\nforce-cache only has an effect on a page that renders again: see /connection-fetch.",
      zh: "時間跟 uuid 都停在 build，跟 /fetch-default 一樣。這頁是 Static，build 之後不會再 render，所以有沒有 cache: 'force-cache' 結果都相同。\nforce-cache 在會重新 render 的頁面才有作用，見 /connection-fetch。",
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
