import { Stamp } from '../../stamp'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Stamp route={`/dynamic-segment/${id}`} />
}
