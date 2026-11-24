export function POST() {
  return Response.json({ route: '/api/post', factor: 'POST handler', renderedAt: new Date().toISOString() })
}
