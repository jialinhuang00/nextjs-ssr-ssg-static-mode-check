import { connection } from 'next/server'

import { Stamp } from '../stamp'

export default async function Page() {
  await connection()
  return <Stamp route="/connection" />
}
