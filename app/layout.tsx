import type { Metadata } from 'next'
import {MessageAlertProvider} from './components/MessageAlerts'
import SiteLayout from './components/SiteLayout'
import './globals.css'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'MoHoLocal — Local Community Directory',
  description: 'Local directory, events, and community for Mountain House, Tracy and nearby cities.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
    <MessageAlertProvider><SiteLayout>{children}</SiteLayout></MessageAlertProvider>
  </body></html>
}
