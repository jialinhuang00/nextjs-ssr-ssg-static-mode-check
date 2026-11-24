import type { L } from './i18n'

// What each file beside a page.tsx does, shown in the sidebar popover above the file's code.
// Kept here, not in the file's comments, so it follows the EN / 中文 toggle.
export const EXTRA_NOTES: Record<string, L> = {
  'src/app/ssg-fallback/[id]/loading.tsx': {
    en: 'By design this is sent first while the page is still rendering, but only next dev does that. On the deployed site the first visit to an id generateStaticParams does not return (987654321, 100…) waits for the whole page, and this screen never shows.',
    zh: '照設計，頁面還在 render 時應該先送出這個畫面，但只有 next dev 會這樣做。部署出去的網站上，第一次打開 generateStaticParams 沒回傳的 id（987654321、100⋯⋯），server 會等整頁做完才回應，這個畫面不會出現。',
  },
  'src/app/cookies/cookie-buttons.tsx': {
    en: 'A client component. The browser stores the cookie itself with document.cookie, with no server code involved, then reloads so the next request carries it in the Cookie header. /force-static-cookies imports the same file.',
    zh: 'client component。cookie 是瀏覽器自己用 document.cookie 存的，沒有經過 server；存完就 reload，下一個 request 的 Cookie header 才會帶著它。/force-static-cookies 也 import 這個檔案。',
  },
  'src/app/isr-on-demand/revalidate-button.tsx': {
    en: 'A client component around the server action, so the button shows "…" while it runs and the time it finished afterwards.',
    zh: '包住 server action 的 client component。按下去顯示「…」，做完顯示完成的時間。',
  },
}
