import { Stamp } from '../stamp'
import { UuidTable } from '../uuid-table'

export default async function Page() {
  // httpbin returns a new uuid on every call, so a repeated uuid means this fetch did not run again.
  const res = await fetch('https://httpbin.org/uuid', { cache: 'no-store' })
  const { uuid } = (await res.json()) as { uuid: string }
  return (
    <Stamp route="/fetch-no-store">
      <UuidTable id="/fetch-no-store" rows={[{ code: "fetch(url, { cache: 'no-store' })", uuid }]} />
    </Stamp>
  )
}
