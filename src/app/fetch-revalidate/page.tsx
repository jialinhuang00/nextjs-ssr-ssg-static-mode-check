import { fetchUuid, Stamp } from '../stamp'

export default async function Page() {
  const uuid = await fetchUuid({ next: { revalidate: 30 } })
  return <Stamp route="/fetch-revalidate" detail={`uuid ${uuid}`} />
}
