// Two probes for Gin G1/G2 and G5, pasted into the DevTools console of a page on the site
// (same origin, so the iframe and fetch can be read). Run them on the deployed site, not on
// next dev: dev renders every request, which hides both effects.
//
// 1. fallbackProbe(): does a reader ever see loading.tsx for an id outside generateStaticParams?
//    Opens a never-used id twice in a hidden iframe and polls every 10 ms for the loading h1
//    and for the page's own h1. curl shows bytes; this shows what the browser actually paints.
//    Self-check: the second open must come back fast with the same id, or the cache is not
//    being hit and the first number means nothing.
//
// 2. onDemandProbe(): run on /isr-on-demand. Reads the hidden <time data-rendered> and the
//    shown time before and after pressing revalidatePath, then fetches the page twice.
//    Answers: does the screen update after the press, and does the first reload get the page
//    made at the press or a page made at that reload?

async function fallbackProbe() {
  async function open(path) {
    const f = document.createElement('iframe')
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:400px;height:300px'
    const t0 = performance.now()
    let sawLoading = null
    let sawPage = null
    document.body.appendChild(f)
    f.src = path
    await new Promise((res) => {
      const id = setInterval(() => {
        const t = Math.round(performance.now() - t0)
        const d = f.contentDocument
        if (d && d.location.href !== 'about:blank') {
          const h1 = [...d.querySelectorAll('main h1')].filter((x) => x.offsetParent !== null).map((x) => x.textContent)
          if (h1.includes('loading…') && sawLoading === null) sawLoading = t
          if (h1.includes(path) && sawPage === null) sawPage = t
        }
        if (t > 6000 || (sawPage !== null && t > sawPage + 300)) {
          clearInterval(id)
          res()
        }
      }, 10)
    })
    f.remove()
    return { path, sawLoading, sawPage }
  }
  const path = `/ssg-fallback/${Math.floor(1000 + Math.random() * 1e9)}`
  const first = await open(path)
  const second = await open(path)
  if (second.sawPage === null || second.sawPage > 1000) throw new Error('second open was not served from cache')
  return [first, second]
}

async function onDemandProbe() {
  const el = () => document.querySelector('time[data-rendered]')
  const read = () => ({ hidden: el().textContent, shown: el().parentElement.textContent.replace(/reload|loading…/g, '').trim() })
  const renderedIn = async () => (await (await fetch(location.href, { cache: 'no-store' })).text()).match(/data-rendered="true" hidden="">([^<]*)/)[1]
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  const before = read()
  const pressAt = new Date().toISOString()
  document.querySelector('form button[type=submit]').click()
  await wait(4000)
  const afterPress = read()
  await wait(3000)
  const reloadAt = new Date().toISOString()
  const reload1 = await renderedIn()
  await wait(2000)
  const reload2 = await renderedIn()
  return { before, pressAt, afterPress, reloadAt, reload1, reload2 }
}

// 3. navProbe(): does loading.tsx show on a client-side navigation instead of a full load?
//    Run in the console of any page of the deployed site (it uses the App Router instance at
//    window.next.router). Each run uses a never-opened id and polls the visible h1 every 10 ms.
//    prefetchWait: null = plain push; a number = prefetch first, wait that many ms, then push.
//    Self-check: stops if window.next.router is missing (not an App Router page).
async function navProbe(prefetchWait = null) {
  if (!window.next?.router?.push) throw new Error('no window.next.router: not an App Router page')
  const path = '/ssg-fallback/' + (1000 + Math.floor(Math.random() * 1e9))
  if (prefetchWait !== null) {
    window.next.router.prefetch(path)
    await new Promise((r) => setTimeout(r, prefetchWait))
  }
  const t0 = performance.now()
  let sawLoading = null
  let sawPage = null
  window.next.router.push(path)
  await new Promise((done) => {
    const iv = setInterval(() => {
      const t = Math.round(performance.now() - t0)
      const h1 = [...document.querySelectorAll('main h1')].filter((x) => x.offsetParent !== null).map((x) => x.textContent)
      if (h1.includes('loading…') && sawLoading === null) sawLoading = t
      if (h1.includes(path) && sawPage === null) sawPage = t
      if (t > 6000 || (sawPage !== null && t > sawPage + 200)) {
        clearInterval(iv)
        done()
      }
    }, 10)
  })
  return { prefetchWait, path, sawLoading, sawPage }
}
// 2026-11-22, deploy 1b9680ab: navProbe() 2193 ms, navProbe(300) 1903 ms, navProbe(3000) 15 ms,
// sawLoading null in all three.
