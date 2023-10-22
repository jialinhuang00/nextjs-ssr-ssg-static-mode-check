export default async function SSRPage({
  params,
}: {
  params: { userId: string };
}) {
  const data = await getthejsontestdata(params.userId);
  return (
    <div className="flex flex-col gap-2 p-8">
      <p>/ssr-users/{params.userId}</p>
      <pre className="max-w-[80vw] whitespace-pre-wrap p-4 bg-[#eaeaea]">
        {JSON.stringify(data)}
      </pre>
    </div>
  );
}

const getthejsontestdata = async (id: string) => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);

  return res.json();
};
