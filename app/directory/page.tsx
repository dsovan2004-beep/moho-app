import DirectoryBrowser from '@/app/components/DirectoryBrowser'
import {directoryMetadata,type DirectorySearch} from '@/lib/directory-metadata'
export const runtime = 'nodejs'
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectorySearch>}) {
  return directoryMetadata(await searchParams)
}
export default function DirectoryPage() { return <DirectoryBrowser /> }
