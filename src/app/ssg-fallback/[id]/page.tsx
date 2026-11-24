import { Stamp } from '../../stamp'

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }]
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Ids outside the list render on their first visit; wait 2 s there so the first visit is easy
  // to tell from a stored page. (loading.tsx shows during that wait only in next dev.)
  if (!['1', '2', '3'].includes(id)) await new Promise((r) => setTimeout(r, 2000))
  return <Stamp route={`/ssg-fallback/${id}`} />
}
