import { fetchUuid, Stamp } from '../stamp'

export default async function Page() {
  const uuid = await fetchUuid({ cache: 'force-cache' })
  return <Stamp route="/fetch-force-cache" detail={`uuid ${uuid}`} />
}
