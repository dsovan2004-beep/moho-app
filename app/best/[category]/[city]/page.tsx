import { notFound, permanentRedirect } from 'next/navigation'
import { legacyBestDestination } from '@/lib/legacy-discovery'

export const runtime='nodejs'
interface PageProps { params:Promise<{category:string;city:string}> }

export default async function LegacyBestPage({params}:PageProps) {
  const {category,city}=await params
  const destination=legacyBestDestination(category,city)
  if(!destination) notFound()
  permanentRedirect(destination)
}
