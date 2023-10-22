import Link from "next/link";

export default function ClientSideAbout() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <p>This is `client-side-navigation` About Page</p>
      <Link href="/navigation-type">Back to /navigation-type</Link>
    </div>
  );
}
