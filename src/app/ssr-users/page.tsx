import Link from "next/link";

export default async function SSRPage() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <p>/ssr-users</p>
      <Link href="/ssr-users/3">user 3</Link>
      <Link href="/ssr-users/4">user 4</Link>
      <Link href="/ssr-users/5">user 5</Link>
      <Link href="/ssr-users/6">user 6</Link>
      <Link href="/ssr-users/8">user 8</Link>
      <a href="/ssr-users/9">user 9 (html anchor so no prefetch)</a>
    </div>
  );
}
