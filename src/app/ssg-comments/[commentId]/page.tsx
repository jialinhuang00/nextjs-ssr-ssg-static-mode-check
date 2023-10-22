export default async function SSGCommentsPage() {
  return <p>`ssg`: /ssg-comments/[commentId]</p>;
}

/**
 *
 * Using `generateStaticParams` will result in SSG.
 *
 * If we return specific `[...]` in `generateStaticParams`, it will explicitly build specific pages.
 *
 * - /ssg-comments/[commentId]
 *
 *   - /ssg-comments/1
 *
 *   - /ssg-comments/2
 *
 *   - /ssg-comments/3
 *
 *  ...
 *
 */
export async function generateStaticParams() {
  const postFourComments = await fetch(
    "https://jsonplaceholder.typicode.com/posts/4/comments"
  ).then((res) => res.json());

  return postFourComments.map((comment: any) => ({
    commentId: comment.id.toString(),
  }));
}
