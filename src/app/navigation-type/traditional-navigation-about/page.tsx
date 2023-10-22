export default async function TraditionalAboutPage() {
  const serverData = await getthejsontestdata();
  return (
    <div className="flex flex-col gap-4 p-8">
      <p>This is `Traditional Navigaiton` About page</p>
      <a href="/navigation-type">Back to /navigation-type also by ssr</a>
      <pre className="max-w-[480px] whitespace-pre-wrap bg-[#fafafa]">
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
