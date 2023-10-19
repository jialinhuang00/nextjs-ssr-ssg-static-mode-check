//{cache: "no-store"} -> ssr
// {} -> static
export default async function Home() {
  const res = await fetch("https://api.quotable.io/random?tags=technology", {
    cache: "no-cache",
  });
  return (
    <pre className="w-80vw m-8 whitespace-break-spaces">
      static{JSON.stringify(await res.json())}
    </pre>
  );
}
