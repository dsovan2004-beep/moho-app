export const runtime='nodejs'
// Keep the legacy URL pointing to the single current sitemap.
export async function GET() {return Response.redirect('https://www.moholocal.com/sitemap.xml',308)}
