import { Stamp } from '../stamp'

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = (await searchParams).q ?? '(none)'
  return <Stamp route="/search-params" detail={`q = ${q}`} />
}
