import { cookies } from 'next/headers'

import { Stamp } from '../stamp'

export default async function Page() {
  const n = (await cookies()).getAll().length
  return <Stamp route="/cookies" detail={`cookies seen: ${n}`} />
}
