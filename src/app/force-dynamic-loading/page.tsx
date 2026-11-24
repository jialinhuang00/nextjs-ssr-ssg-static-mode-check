import { Stamp } from '../stamp'

export const dynamic = 'force-dynamic'

export default async function Page() {
  // Every request renders here, nothing is stored; wait 2 s so loading.tsx has time to show.
  await new Promise((r) => setTimeout(r, 2000))
  return <Stamp route="/force-dynamic-loading" />
}
