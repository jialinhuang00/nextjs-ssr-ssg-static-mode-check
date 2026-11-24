import { Stamp } from '../stamp'
import { UuidTable } from '../uuid-table'

export default async function Page() {
  // httpbin returns a new uuid on every call, so a repeated uuid means this fetch did not run again.
  const res = await fetch('https://httpbin.org/uuid')
  const { uuid } = (await res.json()) as { uuid: string }
  return (
    <Stamp route="/fetch-default">
      <UuidTable id="/fetch-default" rows={[{ code: 'fetch(url)', uuid }]} />
    </Stamp>
  )
}
