export const dynamic = 'force-static'

export function GET() {
  return Response.json({ route: '/api/get-force-static', factor: "GET handler with dynamic = 'force-static'", renderedAt: new Date().toISOString() })
}
