export default async function SSGCommentsNoSpecGeneratingPage() {
  return <p>`ssg`: /ssg-no-spec-generating-comments/[commentId]</p>;
}

export async function generateStaticParams() {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts/1/comments"
  );

  return res.json();
}
