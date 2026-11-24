import { fetchUuid, Stamp } from '../stamp'

export default async function Page() {
  const uuid = await fetchUuid({ cache: 'no-store' })
  return <Stamp route="/fetch-no-store" detail={`uuid ${uuid}`} />
}
