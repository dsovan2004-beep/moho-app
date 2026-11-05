export const runtime = 'nodejs'

// Retired: notifications must be tied to a saved request and verified recipient.
export function POST() {
  return Response.json({ error: 'Use the business request form.' }, { status: 410 })
}
