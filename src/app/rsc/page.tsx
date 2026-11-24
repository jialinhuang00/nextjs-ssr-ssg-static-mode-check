import { Code } from "../highlight"
import { type L } from "../i18n"
import { SiteHeader } from '../site-header'
import { QUICK } from './quick-answers'
import { RscDemo } from './rsc-demo'

// /rsc: the two iframes first, then the explanation in three parts, ordered by who owns what:
// the rules React defines (RSC), how Next.js carries them out, and a table of the names.
// No 'use client' here, so this file runs only on the server, at build (nothing in it needs a
// request). The browser gets its output, never its code.

// Prose with every code-like token set as <code>: directives, file names, env variables, hooks,
// commands, paths. Same two spans as T, so the language switch still works.
const CODE = new RegExp(
  '(' +
    [
      "import 'server-only'",
      "'use (?:client|server)'",
      'server-only',
      'throw new Error\\(".*?"\\)',
      "output: 'export'",
      'process\\.env\\.\\w+',
      'NEXT_PUBLIC_\\w*',
      'RSC_DEMO_SERVER',
      'typeof window',
      'window\\.innerWidth',
      '\\{children\\}',
      '\\bchildren\\b',
      '\\b(?:useState|useEffect|onClick|revalidatePath|undefined)\\b',
      'rebuild\\(\\)',
      'next (?:build|start|dev)',
      'next-action',
      'react-server-dom-\\w+',
      'react-server',
      'use\\(\\)',
      'c:I\\[87594,…\\]',
      'svc-[\\w-]*',
      // lowercase start and no letter before it, so Node.js and Next.js stay names
      '(?<![\\w.])[a-z][\\w/-]*\\.(?:tsx|ts|js|json)\\b',
      '(?<![\\w/])/(?:static|isr-on-demand|rsc)\\b',
    ].join('|') +
    ')',
)

function code(text: string) {
  return text.split(CODE).map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))
}

// [words](https://…) in a string becomes a link on those words, the rest goes through code().
function links(text: string) {
  return text.split(/\[([^\]]+)\]\((https:[^)]+)\)/).map((part, i, all) =>
    i % 3 === 0 ? <span key={i}>{code(part)}</span> : i % 3 === 1 ? <a key={i} href={all[i + 1]}>{code(part)}</a> : null,
  )
}

// **words** in a string becomes bold; inside and outside, links and code still apply.
function rich(text: string) {
  return text.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{links(part)}</strong> : <span key={i}>{links(part)}</span>))
}

function R({ t }: { t: L }) {
  return (
    <>
      <span data-l="en">{rich(t.en)}</span>
      <span data-l="zh">{rich(t.zh)}</span>
    </>
  )
}

function P({ en, zh }: L) {
  return (
    <p>
      <R t={{ en, zh }} />
    </p>
  )
}

function H({ en, zh }: L) {
  return (
    <h3>
      <span className="scribble">
        <R t={{ en, zh }} />
      </span>
    </h3>
  )
}

// The quick Q&A at the end: each question in bold, its answer, and code under it when there is any.
function QuickAnswers() {
  return (
    <dl className="qa">
      {QUICK.map((x) => (
        <div key={x.q.en} className={x.sub ? 'sub' : undefined}>
          <dt>
            <R t={x.q} />
          </dt>
          <dd>
            <R t={x.a} />
            {x.code && <Code code={x.code} lang={x.lang} />}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// Real lines from the RSC payload of /static on the deployed site (inside self.__next_f.push).
const PAYLOAD = `["$","h1",null,{"children":"/static"}]
c:I[87594,["$2","$8"],"ReloadButton"]
["$","$Lc",null,{}]`

// One row of the names table: name, owner, how it is written (code, or words), where it runs.
type Row = [string, L, string | L, L]
const REACT: L = { en: 'React', zh: 'React' }
const NAMES: Row[] = [
  ['RSC', REACT, '—', { en: 'the name of the whole set of rules', zh: '整套規則的名字' }],
  ['server component', REACT, { en: 'nothing', zh: '不用寫' }, { en: 'server only', zh: '只在 server' }],
  ['client component', REACT, "'use client'", { en: 'server once for the HTML, then the browser', zh: 'server 跑一次產生 HTML，瀏覽器再跑一次' }],
  ['server function', REACT, "'use server'", { en: 'server only; the browser calls it', zh: '只在 server，由瀏覽器呼叫' }],
  ['server action', REACT, "'use server'", { en: 'a server function passed to an action prop or called inside an action', zh: '傳給 action prop、或在 action 裡呼叫的 server function' }],
  ['hydration', REACT, '—', { en: 'the browser runs client components again on the server HTML', zh: '瀏覽器把 client component 在 server 給的 HTML 上再跑一次' }],
  ['server-only', { en: 'an npm package ([maintainer sebmarkbage, bugs go to facebook/react](https://www.npmjs.com/package/server-only))', zh: 'npm 套件（[維護者是 sebmarkbage，bug 回報在 facebook/react](https://www.npmjs.com/package/server-only)）' }, "import 'server-only'", { en: 'never runs; the build fails if it lands in browser JS', zh: '本身不跑，進了瀏覽器的 JS 就 build 失敗' }],
  ['NEXT_PUBLIC_', { en: 'Next.js', zh: 'Next.js' }, { en: 'a variable name prefix', zh: '變數名稱的前綴' }, { en: 'written into browser JS at build', zh: 'build 時寫進瀏覽器的 JS' }],
]

// The steps of one server action call, in order; plain text, so no highlighting.
const ACTION_FLOW = `button pressed
→ browser POSTs to the same URL, with the header next-action: <id>
→ Next.js's handler looks up the id, finds rebuild(), runs it on the server
→ the response carries the new payload, and React updates the page`

export default function Rsc() {
  return (
    <main className="about rsc">
      <SiteHeader at="rsc" />

      <section>
        <h2>server component vs client component</h2>
        <RscDemo />
        <ul className="plain">
          <li>
            <R t={{ en: 'JS on: +1 on the right counts and the width shows. On the left nothing happens.', zh: 'JS 開：右邊按 +1 會加一，寬度也有數字。左邊按了沒反應。' }} />
          </li>
          <li>
            <R t={{ en: 'JS off: both look the same and neither button works. That is the HTML the server sent.', zh: 'JS 關：兩邊長得一樣，都按不動。這就是 server 送來的 HTML。' }} />
          </li>
          <li>
            <R t={{ en: 'So the right side works because the browser downloads its code and runs it again, attaching onClick. That is hydration. The left code never reaches the browser.', zh: '右邊能動，是因為瀏覽器下載了它的 code 再跑一次，把 onClick 接上去，這一步叫 hydration。左邊的 code 沒有送到瀏覽器。' }} />
          </li>
          <li>
            <R t={{ en: 'The svc- line under each box searches that page\'s JS files: the left marker is not there, the right one is.', zh: '框下面 svc- 那行，是搜尋那頁 JS 檔的結果：左邊的標記找不到，右邊的找得到。' }} />
          </li>
        </ul>
      </section>

      <section>
        <h2>
          <R t={{ en: '1. RSC: the rules React defines', zh: '1. RSC：React 定的規則' }} />
        </h2>
        <P
          en="The two iframes run almost the same code. The right file has one more line at the top, 'use client'. React defines that line; Next.js only implements it. React calls the rules RSC (React Server Components): a component can run only on the server, and the browser gets only what it rendered. There are three ways to write a piece of code under these rules:"
          zh="上面兩個 iframe 跑的 code 幾乎一樣，只有右邊的檔案第一行多了 'use client'。這一行由 React 定義，Next.js 只是照著實作。React 把這套規則叫 RSC（React Server Components），讓元件可以只在 server 上跑，瀏覽器只收到它 render 好的結果。在這套規則底下，一段 code 有三種寫法："
        />
        <ul className="plain">
          <li>
            <R t={{ en: 'No directive: a server component. It runs only on the server.', zh: '什麼都不寫：server component，只在 server 上跑。' }} />
          </li>
          <li>
            <R t={{ en: "'use client' on the first line of a file: a client component. The server runs it once for the HTML, then the browser runs it again.", zh: "檔案第一行寫 'use client'：client component。server 先跑一次產生 HTML，瀏覽器再跑一次。" }} />
          </li>
          <li>
            <R t={{ en: "'use server' inside a function, or on the first line of a file: a server function. It runs on the server, and the browser can call it.", zh: "函式裡（或檔案第一行）寫 'use server'：server function。函式在 server 上跑，瀏覽器可以呼叫它。" }} />
          </li>
        </ul>
        <P
          en="'use server' marks a function, not a component. A server component has no directive at all."
          zh="'use server' 標的是函式，跟元件無關。server component 本身不用寫任何 directive。"
        />

        <H en="server component: a component with no directive" zh="server component：沒寫 directive 的元件" />
        <P
          en="It can be an async function that awaits its data right in the component, with no API route in between. This runs on the server, so fetching another domain meets no CORS check: only the browser checks CORS."
          zh="它可以是 async 函式，直接在元件裡 await 資料，中間不用另外寫 API route。因為這段在 server 上跑，就算 fetch 的是別的網域也不會碰到 CORS，CORS 只有瀏覽器會檢查。"
        />
        <Code
          code={`export default async function Page() {
  const user = await fetch('https://api.other.com/user/1').then((r) => r.json())
  return <h1>{user.name}</h1>
}`}
        />
        <P
          en="It cannot use useState or useEffect, and an onClick on it is an error, because a server component has no way to hand a function to the browser. So the left +1 above has no onClick at all."
          zh="它不能用 useState、useEffect，寫 onClick 也會報錯，因為 server component 沒辦法把函式交給瀏覽器。所以上面左邊那顆 +1 根本沒寫 onClick。"
        />

        <H en="'use client': from this file down, everything goes to the browser" zh="'use client'：從這個檔案往下，全部進瀏覽器" />
        <P
          en="'use client' is a boundary. The file that has it, plus everything that file imports, is bundled into the browser JS. An imported file that does not say 'use client' itself goes too:"
          zh="'use client' 是一條邊界。寫了它的檔案，加上這個檔案 import 的所有東西，都會打包進瀏覽器的 JS。被 import 的檔案就算自己沒寫 'use client'，也一樣會進去："
        />
        <Code
          code={`// modal.tsx
'use client'
import { Button } from './button' // button.tsx has no directive, and still ships to the browser`}
        />
        <P
          en="So a component with no directive is not always a server component. button.tsx above writes nothing, yet modal.tsx imports it, so it becomes a client component and its code goes to the browser."
          zh="所以沒寫 directive 的元件，不一定是 server component。上面的 button.tsx 什麼都沒寫，但因為 modal.tsx import 了它，它就變成 client component，code 也跟著送到瀏覽器。"
        />
        <P
          en="It is needed only for state, event handlers, useEffect or browser APIs, so usually only the interactive piece becomes a client component and the rest stays on the server:"
          zh="只有用到 state、event handler、useEffect 或瀏覽器 API 時才需要它，所以通常只把要互動的那一小塊做成 client component，其他留在 server："
        />
        <Code
          code={`// layout.tsx (server)
<nav>
  <Logo />   {/* server */}
  <Search /> {/* 'use client' */}
</nav>`}
        />
        <P
          en="Both of these put Cart inside Modal on screen. The only difference is which file has the import line:"
          zh="下面兩種寫法，畫面上都是 Cart 放在 Modal 裡面，差別只在 import Cart 的那一行寫在哪個檔案："
        />
        <div className="code-pair">
          <div>
            <P
              en="A: **Cart is server component**"
              zh="A: **Cart is server component**"
            />
            <Code
              code={`// page.tsx (server)
import { Modal } from './modal' // 'use client'
import { Cart } from './cart'   // no directive

export default function Page() {
  return <Modal><Cart /></Modal>
}`}
            />
          </div>
          <div>
            <P
              en="B: **Cart is affected to be client component**"
              zh="B: **Cart is affected to be client component**"
            />
            <Code
              code={`// modal.tsx
'use client'
import { Cart } from './cart'

export function Modal() {
  return <div><Cart /></div>
}`}
            />
          </div>
        </div>
        <Code
          code={`// page.tsx (server)
import { Like } from './like' // 'use client'

export default function Page() {
  return <Like initial={3} onLike={() => console.log('hi')} />
}`}
        />
        <P
          en="Like runs in the browser, so the props Page gives it are first written as text into the RSC payload and sent over. The number 3 can be written as text:"
          zh="Like 在瀏覽器跑，所以 Page 給它的 props 要先寫成文字，放進 RSC payload 送過去。數字 3 可以寫成文字："
        />
        <Code lang="json" code={`["$","$Lc",null,{"initial":3}]`} />
        <P
          en="() => console.log('hi') cannot. A function does not turn into text the way 3 does: JSON.stringify(() => {}) gives undefined. So Next.js reports an error. The exception is a 'use server' server function. Next.js puts an id for it into the payload, and when Like calls onLike, the browser sends that id back and the server runs the function."
          zh="() => console.log('hi') 就不行。函式沒辦法像 3 那樣轉成文字，JSON.stringify(() => {}) 得到的是 undefined，所以 Next.js 會報錯。例外是 'use server' 的 server function。Next.js 會在 payload 裡放一個代表它的 id，Like 呼叫 onLike 的時候，瀏覽器把這個 id 送回 server，由 server 執行那個函式。"
        />
        <P
          en="Values only the browser has are read in useEffect. Read typeof window during render instead, and the server gets undefined while the browser gets object; the two renders differ, and React reports a hydration mismatch. The right iframe reads its width in useEffect, which is why it shows — until JS runs:"
          zh="只有瀏覽器才有的值要放在 useEffect 裡讀。如果在 render 時直接讀 typeof window，server 上得到 undefined，瀏覽器得到 object，兩次 render 的結果不一樣，React 就會報 hydration mismatch。右邊 iframe 的寬度是在 useEffect 裡讀的，所以 JS 跑之前它顯示「—」："
        />
        <Code
          code={`const [w, setW] = useState<number | null>(null)
useEffect(() => setW(window.innerWidth), [])`}
        />

        <H en="'use server': a server function the browser can call" zh="'use server'：瀏覽器可以呼叫的 server 函式" />
        <P
          en="React calls it a server function. The /isr-on-demand page on this site has one; the button there calls it:"
          zh="React 叫它 server function。這個網站的 /isr-on-demand 就有一個，那頁的按鈕按下去就是在呼叫它："
        />
        <Code
          code={`async function rebuild() {
  'use server'
  revalidatePath('/isr-on-demand')
}

<RevalidateButton action={rebuild} /> // a client component`}
        />
        <P
          en="It must be async, because calling it from the browser is a network request and the result comes back later. The function body never goes to the browser; the browser gets only an id. What happens on a press is in part 2."
          zh="它一定要是 async，因為瀏覽器呼叫它是一次網路請求，結果要等請求回來才拿到。函式本身不會送到瀏覽器，瀏覽器只拿到一個 id。按下去之後發生什麼，寫在第 2 節。"
        />

        <H en="RSC payload: the format the server sends" zh="RSC payload：server 送給瀏覽器的格式" />
        <P
          en="Besides the HTML, the server sends a description of the page for React. Server component output arrives as finished content; a client component arrives as a pointer to the JS file that holds its code. These three lines come from /static:"
          zh="server 除了 HTML，還會送一份給 React 看的頁面說明，叫 RSC payload。server component 的部分直接是做好的內容，client component 的部分只寫「這裡放一個元件，code 在哪個 JS 檔」。下面三行取自 /static："
        />
        <Code code={PAYLOAD} lang="json" />
        <P
          en="Line 1 is an h1 the server already made. Line 2 says ReloadButton lives in a JS file. Line 3 puts one ReloadButton here. On a full page load the payload is inside the HTML; on a navigation inside the site the browser asks for the payload alone."
          zh="第 1 行是 server 已經做好的 h1。第 2 行寫 ReloadButton 的 code 在哪個 JS 檔。第 3 行是在這裡放一個 ReloadButton。整頁載入時，payload 包在 HTML 裡一起送來；站內換頁時，瀏覽器只跟 server 要 payload。"
        />
      </section>

      <section>
        <h2>
          <R t={{ en: '2. How Next.js carries the rules out', zh: '2. Next.js 怎麼照這套規則跑' }} />
        </h2>
        <P
          en="React defines the rules and the payload format. Next.js reads the directives, bundles, and answers requests, in two stages: at build and at request."
          zh="React 只定規則跟 payload 的格式。Next.js 負責讀 directive、打包、回應 request，工作分成 build 時跟 request 時兩個階段。"
        />

        <H en="At build: the bundler reads the directives" zh="build 時：bundler 讀 directive" />
        <P
          en="During next build, Next.js's bundler (Turbopack on this site) follows the imports file by file:"
          zh="next build 的時候，Next.js 的 bundler（這個網站用的是 Turbopack）沿著 import 一個檔案一個檔案讀下去："
        />
        <ul className="plain">
          <li>
            <R t={{ en: "On 'use client': that file and what it imports go into the browser JS. The server side keeps only a pointer to it, the c:I[87594,…] line in the payload above.", zh: "遇到 'use client'：這個檔案跟它往下 import 的東西打包進瀏覽器的 JS，server 那邊只留一個指向它的 reference，也就是上面 payload 裡的 c:I[87594,…]。" }} />
          </li>
          <li>
            <R t={{ en: "On 'use server': the function stays on the server, and the browser JS gets an action id in its place.", zh: "遇到 'use server'：函式留在 server，瀏覽器的 JS 裡只放一個 action id。" }} />
          </li>
          <li>
            <R t={{ en: 'On process.env.NEXT_PUBLIC_X: the value is written straight into the browser JS. At build, [static-env.ts](https://github.com/vercel/next.js/blob/v16.4.6/packages/next/src/lib/static-env.ts#L23-L35) walks process.env and picks the variables starting with NEXT_PUBLIC_, and [define-env.ts](https://github.com/vercel/next.js/blob/v16.4.6/packages/next/src/build/define-env.ts#L122-L132) hands them to the bundler as text to replace. A variable without the prefix is not on that list.', zh: '遇到 process.env.NEXT_PUBLIC_X：把值直接寫進瀏覽器的 JS。[static-env.ts](https://github.com/vercel/next.js/blob/v16.4.6/packages/next/src/lib/static-env.ts#L23-L35) 在 build 時掃過 process.env，挑出 NEXT_PUBLIC_ 開頭的變數，[define-env.ts](https://github.com/vercel/next.js/blob/v16.4.6/packages/next/src/build/define-env.ts#L122-L132) 再把它們交給 bundler 當成要替換的文字。沒有這個前綴的變數不在這份清單裡。' }} />
          </li>
          <li>
            <R t={{ en: 'A static page has its server components run right here, and is stored as HTML plus payload.', zh: 'static 的頁面在這一步就把 server component 跑完，存成 HTML 跟 payload。' }} />
          </li>
        </ul>
        <P
          en="Each iframe above has a 'proof' section you can open, listing the two environment variables as that side read them. RSC_DEMO_SERVER has a value on the left and is undefined on the right, because the browser JS never had it. NEXT_PUBLIC_RSC_DEMO has a value on both sides, which also means anyone who opens the JS file can read it. It is fixed at build, so changing it needs another build. An API key goes in a variable without the prefix, read only in server code."
          zh="上面每個 iframe 裡都有一個可以點開的「證據」區塊，列出兩個環境變數在那一側讀到的值。RSC_DEMO_SERVER 左邊有值，右邊是 undefined，因為瀏覽器的 JS 裡從來沒有這個值。NEXT_PUBLIC_RSC_DEMO 兩邊都有值，這也代表任何人打開 JS 檔都能讀到它。這個值在 build 時就定了，要改得重新 build。API key 要放在沒有前綴的變數裡，而且只在 server 的 code 裡讀。"
        />
        <P
          en="The replacement is visible in the JS file the right iframe downloads. These three lines in client-demo.tsx come out of the bundler like this:"
          zh="這個替換在右邊 iframe 下載的 JS 檔裡就找得到。client-demo.tsx 裡的這三行，打包之後變成這樣："
        />
        <Code
          code={`// client-demo.tsx, as written
where: typeof window,
secret: process.env.RSC_DEMO_SERVER,
pub: process.env.NEXT_PUBLIC_RSC_DEMO,

// the same lines in the browser JS on nextmode.jialin00.com (production build)
where:"object",                        // typeof window, replaced at build too
secret:d.default.env.RSC_DEMO_SERVER,  // still a lookup; the browser has no such value
pub:"also-in-the-browser"              // the value itself`}
        />

        <H en="At request: what runs the server side" zh="request 時：server 上是誰在跑" />
        <P
          en="There is no separate Next.js server program. next start on your own machine is a Node.js process; its http server hands every request to Next.js's handler. This site is deployed on Cloudflare, which has no Node, so OpenNext wraps the same handler into a Worker. A site that is all static (output: 'export') is just files and needs no server; SSR, ISR regeneration and server actions all need one."
          zh="沒有一個獨立的「Next.js server」程式。在自己電腦上跑 next start，就是一個 Node.js process，裡面的 http server 把每個 request 交給 Next.js 的 handler。這個網站部署在 Cloudflare，那裡沒有 Node，所以 OpenNext 把同一個 handler 包成 Worker 來跑。如果整個網站都是 static（output: 'export'），就只剩一堆檔案，不需要 server；SSR、ISR 重新產生頁面、server action 都需要它。"
        />
        <P en="A press of the button on /isr-on-demand goes like this:" zh="在 /isr-on-demand 按下按鈕，過程是這樣：" />
        <pre className="hl">
          <code>{ACTION_FLOW}</code>
        </pre>
        <P
          en="[React's docs](https://react.dev/reference/rsc/server-functions) call a server function a server action when it is passed to an action prop or called inside an action. rebuild() on /isr-on-demand is called inside a form's action, so it is one. The browser talks only to its own site the whole time, so a server action that calls another domain meets no CORS check either."
          zh="[React 的文件](https://react.dev/reference/rsc/server-functions)把傳給 action prop、或在 action 裡呼叫的 server function 叫做 server action。/isr-on-demand 在 form 的 action 裡呼叫 rebuild()，所以 rebuild() 就是 server action。整個過程瀏覽器只跟自己的網站溝通，所以在 server action 裡呼叫別的網域，一樣不會碰到 CORS。"
        />
      </section>

      <section>
        <h2>
          <R t={{ en: '3. Whose name is which', zh: '3. 這些名詞各是誰的' }} />
        </h2>
        <table className="cmp">
          <thead>
            <tr>
              <th><R t={{ en: 'name', zh: '名詞' }} /></th>
              <th><R t={{ en: 'from', zh: '誰定的' }} /></th>
              <th><R t={{ en: 'written as', zh: '寫法' }} /></th>
              <th><R t={{ en: 'runs', zh: '在哪跑' }} /></th>
            </tr>
          </thead>
          <tbody>
            {NAMES.map(([name, from, how, where]) => (
              <tr key={name}>
                {/* concept names stay plain; only real code names (server-only, NEXT_PUBLIC_) get <code> */}
                <td>{code(name)}</td>
                <td><R t={from} /></td>
                <td>{typeof how === 'string' ? <code>{how}</code> : <R t={how} />}</td>
                <td><R t={where} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <H en="Quick answers" zh="快問快答" />
        <QuickAnswers />
      </section>

    </main>
  )
}
