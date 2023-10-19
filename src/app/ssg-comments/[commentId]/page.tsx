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
 *   - /ssg-comments/11
 *
 *   - /ssg-comments/22
 *
 *   - /ssg-comments/33
 *
 *  ...
 *
 */
export async function generateStaticParams() {
  const comments = await Promise.resolve([
    { id: 11, commentText: "id 1 comment" },
    { id: 22, commentText: "id 2 comment" },
    { id: 33, commentText: "id 3 comment" },
  ]);

  return comments.map((comment) => ({ commentId: comment.id.toString() }));
}
