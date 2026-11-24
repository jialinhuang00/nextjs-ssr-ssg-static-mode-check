import { Explorer } from './explorer'
import { ROUTES } from './routes'

// POST /api/post cannot be opened in an iframe (GET only); try it with curl -X POST.
export default function Home() {
  return <Explorer routes={ROUTES} />
}
