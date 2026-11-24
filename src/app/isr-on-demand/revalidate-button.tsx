'use client'
import { useActionState } from 'react'

import { T } from '../i18n'

// Wraps the server action so the button says what happened. The action's response carries the
// newly rendered page, so time[data-rendered] changes at once; useRendered in i18n.tsx watches
// that element, so the shown time and age follow it.
export function RevalidateButton({ action }: { action: () => Promise<void> }) {
  const [doneAt, run, pending] = useActionState(async () => {
    await action()
    return new Date().toLocaleTimeString('sv-SE')
  }, null)
  return (
    <form action={run}>
      <button type="submit" className="btn" disabled={pending}>
        revalidatePath(&apos;/isr-on-demand&apos;)
      </button>
      {pending && <p className="hint">…</p>}
      {doneAt && !pending && <Done at={doneAt} />}
    </form>
  )
}

function Done({ at }: { at: string }) {
  return (
    <p className="hint">
      <T t={{ en: `Cache cleared at ${at}. The page was made again, so the time above changed to it.`, zh: `${at} 已清掉快取。頁面重新產生了一次，上面的產生時間跟著換成新的。` }} />
    </p>
  )
}
