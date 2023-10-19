type Params = {
  params: {
    userId: string;
  };
};
export default async function SsrUserPage({ params: { userId } }: Params) {
  return <p className="text-black">params is {userId} </p>;
}

export async function generateStaticParams() {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts/1/comments"
  );

  if (!res.ok) throw new Error("Failed to fetch data");

  return res.json();
}
