import { Stamp } from '../stamp'
import { UuidTable } from '../uuid-table'

export default async function Page() {
  // httpbin returns a new uuid on every call, so a repeated uuid means this fetch did not run again.
  const res = await fetch('https://httpbin.org/uuid', { next: { revalidate: 30 } })
  const { uuid } = (await res.json()) as { uuid: string }
  return (
    <Stamp route="/fetch-revalidate">
      <UuidTable id="/fetch-revalidate" rows={[{ code: 'fetch(url, { next: { revalidate: 30 } })', uuid }]} />
    </Stamp>
  )
}
