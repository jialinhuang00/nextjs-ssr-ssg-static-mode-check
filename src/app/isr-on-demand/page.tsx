import { revalidatePath } from 'next/cache'

import { Stamp } from '../stamp'
import { RevalidateButton } from './revalidate-button'

export const revalidate = false

async function rebuild() {
  'use server'
  revalidatePath('/isr-on-demand')
}

export default function Page() {
  return (
    <Stamp route="/isr-on-demand">
      <RevalidateButton action={rebuild} />
    </Stamp>
  )
}
