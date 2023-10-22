import Link from "next/link";

export default async function ClientSideNavigationNoPrefetchAboutPage() {
  const serverData = await getthejsontestdata();
  return (
    <div className="flex flex-col gap-4 p-8">
      <p>This is `Client Side With No prefetch Navigation` About Page</p>
      <Link href="/navigation-type">Back to /navigation-type</Link>
      <pre className="max-w-[480px] whitespace-pre-wrap bg-[#eaeaea]">
        {JSON.stringify(serverData)}
      </pre>
    </div>
  );
}

const getthejsontestdata = async () => {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts/1/comments"
  );
  return res.json();
};
