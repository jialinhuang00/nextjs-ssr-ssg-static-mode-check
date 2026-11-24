export function GET() {
  return Response.json({ route: '/api/get', factor: 'GET handler, no config', renderedAt: new Date().toISOString() })
}
