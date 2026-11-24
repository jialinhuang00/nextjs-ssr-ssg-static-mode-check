'use client'
import { T } from '../i18n'

// The browser stores the cookie itself (document.cookie); no server code is involved. From then
// on it sends the cookie in the Cookie header of every request to this site, which is the only
// way a cookie reaches cookies() on the server. Each one expires after 10 minutes.
export function CookieButtons() {
  return (
    <p>
      <button
        type="button"
        className="btn"
        onClick={() => {
          document.cookie = `demo-${Date.now()}=1; path=/; max-age=600`
          location.reload()
        }}
      >
        <T t={{ en: 'add a cookie, then reload', zh: '加一個 cookie 再 reload' }} />
      </button>{' '}
      <button
        type="button"
        className="btn"
        onClick={() => {
          for (const pair of document.cookie.split('; ')) {
            const name = pair.split('=')[0]
            if (name.startsWith('demo-')) document.cookie = `${name}=; path=/; max-age=0`
          }
          location.reload()
        }}
      >
        <T t={{ en: 'remove them, then reload', zh: '全部刪掉再 reload' }} />
      </button>
    </p>
  )
}
