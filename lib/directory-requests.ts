import { CITY_NAMES } from './cities'

export const BUSINESS_CATEGORIES = ['Restaurants', 'Health & Wellness', 'Beauty & Spa',
  'Home Services', 'Automotive', 'Pet Services', 'Real Estate', 'Education', 'Retail']
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const MAX_REQUEST_BYTES = 16000

export class RequestError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

export function validateRequest(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RequestError('Invalid request.')
  const b = body as Record<string, unknown>
  if (typeof b.requestKey !== 'string' || !UUID.test(b.requestKey)) throw new RequestError('Invalid request reference.')
  if (b.kind !== 'submission' && b.kind !== 'claim') throw new RequestError('Invalid request type.')
  const p = b.payload
  if (!p || typeof p !== 'object' || Array.isArray(p)) throw new RequestError('Invalid request details.')
  const fields = p as Record<string, unknown>
  const allowed = b.kind === 'submission'
    ? ['name', 'category', 'city', 'address', 'phone', 'website', 'description', 'hours']
    : ['owner_name', 'owner_phone', 'role']
  if (Object.keys(fields).some(k => !allowed.includes(k))) throw new RequestError('Unexpected field in request.')
  const payload: Record<string, string> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== 'string' || value.length > 4000) throw new RequestError('Invalid field value.')
    payload[key] = value.trim()
  }
  if (b.kind === 'submission') {
    if (b.businessId != null) throw new RequestError('A new listing cannot have a business ID.')
    if (!payload.name || payload.name.length < 2 || payload.name.length > 160) throw new RequestError('Enter the business name (2–160 characters).')
    if (!CITY_NAMES.includes(payload.city)) throw new RequestError('Choose a supported city.')
    if (!BUSINESS_CATEGORIES.includes(payload.category)) throw new RequestError('Choose a category.')
    if (!payload.description || payload.description.length < 10) throw new RequestError('Describe the business in at least 10 characters.')
    if (!payload.phone && !payload.website) throw new RequestError('Provide a public business phone or website.')
    if (payload.phone && (payload.phone.length > 40 || payload.phone.replace(/\D/g, '').length < 7)) throw new RequestError('Enter a valid public phone number.')
    if (payload.website) {
      try {
        const url = new URL(payload.website)
        if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error()
      } catch { throw new RequestError('Enter a complete http:// or https:// website URL.') }
    }
  } else {
    if (typeof b.businessId !== 'string' || !UUID.test(b.businessId)) throw new RequestError('Invalid business ID.')
    if (!payload.owner_name || payload.owner_name.length < 2 || payload.owner_name.length > 160) throw new RequestError('Enter your name.')
    if (!payload.owner_phone || payload.owner_phone.length > 40 || payload.owner_phone.replace(/\D/g, '').length < 7) throw new RequestError('Enter a valid phone number.')
    if (!['Owner', 'Manager', 'Employee'].includes(payload.role)) throw new RequestError('Choose your role.')
  }
  return { kind: b.kind, businessId: (b.businessId as string | undefined) ?? null, payload, requestKey: b.requestKey }
}

export async function readRequest(req: Request): Promise<unknown> {
  const origin = req.headers.get('origin')
  if (!origin || origin !== new URL(req.url).origin) throw new RequestError('Use the MoHoLocal form to submit this request.', 403)
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new RequestError('JSON is required.', 415)
  if (!req.body) throw new RequestError('Request details are required.')
  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_REQUEST_BYTES) { await reader.cancel(); throw new RequestError('Request is too large.', 413) }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) }
  catch { throw new RequestError('Invalid JSON.') }
}
