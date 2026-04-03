import type { Metadata } from 'next'
import { AuthProvider } from '@/components/providers/auth-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'MultiCRM Pro | Enterprise CRM Platform',
  description: 'Next-generation multi-tenant CRM platform for sales, support, and customer success. Built for enterprises of all sizes.',
  keywords: 'CRM, customer relationship management, sales, support, multi-tenant, enterprise',
  authors: [{ name: 'MultiCRM Pro' }],
  openGraph: {
    title: 'MultiCRM Pro | Enterprise CRM Platform',
    description: 'Next-generation multi-tenant CRM platform for sales, support, and customer success.',
    type: 'website',
    url: 'https://multicrm.in',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
