import { fetchUuid, Stamp } from '../stamp'

export default async function Page() {
  const uuid = await fetchUuid()
  return <Stamp route="/fetch-default" detail={`uuid ${uuid}`} />
}
