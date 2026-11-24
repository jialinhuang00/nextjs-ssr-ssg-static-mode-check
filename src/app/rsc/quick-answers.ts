import type { L } from '../i18n'

// The questions asked while learning this, in the order they came up, each with a short answer.
// Rendered at the end of /rsc, after the names table. code is shown under the answer.
// sub: a follow-up to the question before it, shown indented under it.
export type QA = { q: L; a: L; code?: string; lang?: 'tsx' | 'json'; sub?: true }

export const QUICK: QA[] = [
  {
    q: { en: 'Are a server function and a server action the same thing?', zh: 'server function 跟 server action 是同一個東西嗎？' },
    a: {
      en: "Both names are React's. Every 'use server' function is a server function. [React's docs](https://react.dev/reference/rsc/server-functions) call one a server action only when it is passed to an action prop such as <form action={...}>, or called inside an action, for example inside a function given to startTransition. So every server action is a server function, but not the other way round. Until September 2024 React called them all server actions.",
      zh: "兩個名字都是 React 定的。寫了 'use server' 的函式都是 server function。不過 [React 的文件](https://react.dev/reference/rsc/server-functions)只把符合下面任一條件的叫 server action：傳給 <form action={...}> 這類 action prop 的，或是在 action 裡呼叫的，例如在 startTransition 包住的函式裡呼叫。所以 server action 一定是 server function，反過來不一定。2024 年 9 月以前，React 把它們全部叫 server action。",
    },
  },
  {
    q: { en: "Is a component without 'use client' treated as 'use server'?", zh: "沒寫 'use client' 的元件，就當作 'use server' 嗎？" },
    a: {
      en: "No. A component with no directive is a server component. 'use server' marks only functions and has nothing to do with server components.",
      zh: "不是。沒寫 directive 的元件是 server component。'use server' 只能拿來標函式，跟 server component 沒有關係。",
    },
  },
  {
    q: { en: "Is the 'use server' boundary a function?", zh: "'use server' 的邊界是函式嗎？" },
    a: {
      en: "Yes, one function at the smallest.\nInside a function: that function only.\nOn the first line of a file: every function the file exports.\n'use client' is one whole file at the smallest, [written before any imports](https://github.com/vercel/next.js/blob/v16.4.6/crates/next-custom-transforms/src/transforms/react_server_components.rs#L318-L323).\n[A client component file cannot define a server function](https://github.com/vercel/next.js/blob/v16.4.6/crates/next-custom-transforms/src/transforms/server_actions.rs#L3856-L3866); it imports one from a file that starts with 'use server':",
      zh: "是，最小就是一個函式。\n寫在函式裡：只涵蓋這個函式。\n寫在檔案第一行：涵蓋這個檔案 export 的每個函式。\n'use client' 最小是一整個檔案，而且[要寫在所有 import 之前](https://github.com/vercel/next.js/blob/v16.4.6/crates/next-custom-transforms/src/transforms/react_server_components.rs#L318-L323)。\n[client component 的檔案裡不能定義 server function](https://github.com/vercel/next.js/blob/v16.4.6/crates/next-custom-transforms/src/transforms/server_actions.rs#L3856-L3866)，要從開頭寫了 'use server' 的檔案 import 進來：",
    },
    code: `// actions.ts
'use server'
export async function save(data: FormData) { /* runs on the server */ }

// like.tsx
'use client'
import { save } from './actions' // the browser gets a reference, not the code`,
  },
  {
    q: { en: 'Which ones have to be async?', zh: '哪些一定要是 async？' },
    a: {
      en: "server function: [must be](https://github.com/vercel/next.js/blob/v16.4.6/crates/next-custom-transforms/src/transforms/server_actions.rs#L3867-L3878).\nserver component: may be, or not.\nclient component: cannot be; [React's code](https://github.com/facebook/react/blob/33e52451f2ab39e0a4d186256b2b4d55277e6041/packages/react-reconciler/src/ReactFiberHooks.js#L426-L440) prints the console error \"is an async Client Component\". It waits for data with React's use() or useEffect.",
      zh: 'server function：[一定要](https://github.com/vercel/next.js/blob/v16.4.6/crates/next-custom-transforms/src/transforms/server_actions.rs#L3867-L3878)。\nserver component：可以是，也可以不是。\nclient component：不能是，[React 的程式碼](https://github.com/facebook/react/blob/33e52451f2ab39e0a4d186256b2b4d55277e6041/packages/react-reconciler/src/ReactFiberHooks.js#L426-L440)遇到 async 的 client component 會報錯 is an async Client Component。要等資料就用 React 的 use() 或 useEffect。',
    },
  },
  {
    q: { en: 'Does Next.js implement React’s RSC? How do other packages fit in?', zh: 'Next.js 是在實作 React 的 RSC 嗎？其他套件怎麼跟它合作？' },
    a: {
      en: "Yes. React defines the rules and ships [react-server-dom-webpack](https://github.com/facebook/react/tree/33e52451f2ab39e0a4d186256b2b4d55277e6041/packages/react-server-dom-webpack) and [react-server-dom-turbopack](https://github.com/facebook/react/tree/33e52451f2ab39e0a4d186256b2b4d55277e6041/packages/react-server-dom-turbopack), which turn server component output into the payload and back. Next.js keeps both inside it, and adds the bundler that reads the directives and the server that answers requests.",
      zh: '是。React 定規則，也提供 [react-server-dom-webpack](https://github.com/facebook/react/tree/33e52451f2ab39e0a4d186256b2b4d55277e6041/packages/react-server-dom-webpack)、[react-server-dom-turbopack](https://github.com/facebook/react/tree/33e52451f2ab39e0a4d186256b2b4d55277e6041/packages/react-server-dom-turbopack)，負責把 server component 的結果轉成 payload，在瀏覽器再轉回來。Next.js 把這兩個套件包在自己裡面，再加上讀 directive 的 bundler 和回應 request 的 server。',
    },
  },
  {
    q: { en: 'Is server-only a linter? Does a client component importing it fail?', zh: 'server-only 算是 linter 嗎？client component import 到它就會出錯？' },
    a: {
      en: 'It is not a linter: a linter reads code, while here the bundler, resolving the import, really gets a file that throws. And yes, any client component importing it, directly or through another file, fails the build. [Its package.json](https://unpkg.com/server-only@0.0.1/package.json):',
      zh: '它不是 linter。linter 是讀 code 檢查，server-only 則是 bundler 解析 import 時真的拿到一個會 throw 的檔案。所以沒錯，client component import 到它，不管是直接 import 還是經過別的檔案，build 都會失敗。[它的 package.json](https://unpkg.com/server-only@0.0.1/package.json)：',
    },
    code: `"exports": { ".": { "react-server": "./empty.js", "default": "./index.js" } }`,
    lang: 'json',
  },
  {
    q: { en: 'Why are two files, empty.js and index.js, enough?', zh: '為什麼 empty.js、index.js 兩個檔案就分得開？' },
    sub: true,
    a: {
      en: 'In the exports of the package.json above, "react-server" is a condition name: with that condition on, give empty.js, otherwise index.js. The bundler builds twice and turns the condition on only for the server build, which gets empty.js; the browser build gets [index.js](https://unpkg.com/server-only@0.0.1/index.js), and its throw stops the build. React does the same: [its package.json](https://github.com/facebook/react/blob/33e52451f2ab39e0a4d186256b2b4d55277e6041/packages/react/package.json#L26) uses that condition to point react at ./react.react-server.js.',
      zh: '上面 package.json 的 exports 裡，"react-server" 是一個條件名稱，意思是「啟用這個條件的時候給 empty.js，否則給 index.js」。bundler 會打包兩份，打包 server 那份時啟用這個條件，所以拿到 empty.js；打包瀏覽器那份時沒有啟用，拿到 [index.js](https://unpkg.com/server-only@0.0.1/index.js)，裡面的 throw 讓 build 失敗。React 自己也這樣做，[它的 package.json](https://github.com/facebook/react/blob/33e52451f2ab39e0a4d186256b2b4d55277e6041/packages/react/package.json#L26)用同一個條件把 react 指到 ./react.react-server.js。',
    },
    code: `// index.js: what the browser build gets
throw new Error(
  "This module cannot be imported from a Client Component module. " +
    "It should only be used from a Server Component."
);

// empty.js: what the server build gets
// (an empty file)`,
  },
  {
    q: { en: "A server component importing server-only: no error? Is server-only paired against 'use client'?", zh: "server component import server-only 就不會出錯？它是專門跟 'use client' 互斥嗎？" },
    sub: true,
    a: {
      en: "No error: the server build gets empty.js, which does nothing. What server-only reacts to is landing in the browser build: if a file that imports it goes there, the build fails, whether or not that file says 'use client'.",
      zh: "server component import 它不會出錯，server 那份拿到的是 empty.js，什麼事都不會發生。server-only 擋的是「被打包進瀏覽器」：只要 import 它的檔案進了瀏覽器那份，build 就失敗，那個檔案有沒有寫 'use client' 都一樣。",
    },
  },
  {
    q: { en: 'Does it throw when the page runs?', zh: '它是在執行時 throw error 嗎？' },
    sub: true,
    a: {
      en: 'No, the build fails first, in next dev too, when the page compiles. No visitor ever reaches that throw.',
      zh: '不是，build 時就失敗了，next dev 也是在編譯那頁的時候報錯，不會等到有人打開頁面才 throw。',
    },
  },
  {
    q: { en: 'Does server-only keep code out of the browser JS?', zh: 'server-only 會避免東西被打包進瀏覽器嗎？' },
    sub: true,
    a: {
      en: 'Only by failing the build. It removes nothing itself; the build passes once the import is fixed.',
      zh: '只是讓 build 失敗而已。它本身不會把任何東西拿掉，要把那個 import 改掉，build 才會過。',
    },
  },
  {
    q: { en: "Does 'use client' reach down into what it imports?", zh: "'use client' 會往下延伸嗎？" },
    a: {
      en: 'Yes. A component imported by a client file becomes a client component too, even with no directive of its own, like button.tsx above.',
      zh: '會。被 client 檔案 import 的元件也會變成 client component，就算它自己沒寫任何 directive，像上面的 button.tsx。',
    },
  },
  {
    q: { en: 'A server component passed into a client component as children: does it turn client?', zh: 'server component 當 children 傳進 client component，會變成 client 嗎？' },
    a: {
      en: 'No. Cart imported by page.tsx (server) and written as <Modal><Cart /></Modal> stays a server component; it only sits inside Modal on screen. If modal.tsx imports Cart itself, then Cart becomes a client component.',
      zh: '不會。像 Cart 這樣由 page.tsx（server）import、再寫成 <Modal><Cart /></Modal> 的元件，照樣是 server component，它只是在畫面上放在 Modal 裡面。如果改成 modal.tsx 自己 import Cart，Cart 才會變成 client component。',
    },
  },
  {
    q: { en: 'A fetch inside useEffect: server or client?', zh: '在 useEffect 裡 fetch，算 server 還是 client？' },
    a: {
      en: 'Client. It runs in the browser, so CORS applies. To avoid it, fetch in a server component, a server action or a route handler instead.',
      zh: '算 client。它在瀏覽器裡跑，所以會碰到 CORS。要避開的話，改在 server component、server action 或 route handler 裡 fetch。',
    },
  },
  {
    q: { en: 'A fully static site runs no server, but SSR, ISR or /api always does?', zh: '純靜態網頁不會跑 server，但只要有 SSR、ISR 或 /api 就一定要？' },
    a: {
      en: "Yes. output: 'export' gives only files. SSR, ISR regeneration, server actions and route handlers that run per request all need a running server. A GET route handler is made per request too unless it says otherwise: /api/get here reads nothing from the request and still builds as ƒ, while /api/get-force-static, with dynamic = 'force-static', builds as ○.",
      zh: "對。output: 'export' 產出的只是一堆檔案。SSR、ISR 重新產生頁面、server action，還有每次 request 才跑的 route handler，都需要一直跑著的 server。GET 的 route handler 沒另外設定的話，也是每次 request 才跑：這個網站的 /api/get 完全沒讀 request，build 出來還是 ƒ；/api/get-force-static 加了 dynamic = 'force-static'，build 出來才是 ○。",
    },
  },
  {
    q: { en: 'Is Next.js its own server, or a Node.js server?', zh: 'Next.js 是自己一台 server，還是起一個 Node.js server？' },
    a: {
      en: "next start is a Node.js process whose http server hands each request to Next.js's handler. On Cloudflare, where this site runs, OpenNext wraps that handler into a Worker.",
      zh: 'next start 是一個 Node.js process，裡面的 http server 把每個 request 交給 Next.js 的 handler。這個網站在 Cloudflare 上，OpenNext 把這個 handler 包成 Worker 來跑。',
    },
  },
  {
    q: { en: 'Can a NEXT_PUBLIC_ value hold a secret?', zh: 'NEXT_PUBLIC_ 的值可以放 secret 嗎？' },
    a: {
      en: 'No. [next build writes it into the browser JS](https://github.com/vercel/next.js/blob/v16.4.6/packages/next/src/lib/static-env.ts#L23-L35), where anyone can read it. A secret goes in a variable without the prefix.',
      zh: '不行。[next build 會把它寫進瀏覽器的 JS](https://github.com/vercel/next.js/blob/v16.4.6/packages/next/src/lib/static-env.ts#L23-L35)，任何人都讀得到。secret 要放在沒有前綴的變數裡。',
    },
  },
]
