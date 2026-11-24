import { cookies } from 'next/headers'

import { Stamp } from '../stamp'
import { CookieButtons } from '../cookies/cookie-buttons'

export const dynamic = 'force-static'

export default async function Page() {
  const n = (await cookies()).getAll().length
  return (
    <Stamp route="/force-static-cookies" detail={`cookies seen: ${n}`}>
      <CookieButtons />
    </Stamp>
  )
}
