// Ids 1, 2, 3 are made at build. Any other id is made on its first visit: the fallback
// (loading…) should arrive first, then the page, which is stored for everyone after.
export default function Home() {
  return (
    <main>
      <h1>fallback: true with Cache Components</h1>
      <p>
        <a href="/1">/1</a> (listed) · <a href="/987654321">/987654321</a> (not listed)
      </p>
    </main>
  )
}
