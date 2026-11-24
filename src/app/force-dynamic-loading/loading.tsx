// Next wraps this folder's page in <Suspense fallback={<Loading />}>.
export default function Loading() {
  return (
    <main className="stamp">
      <header>
        <h1>loading…</h1>
      </header>
    </main>
  )
}
