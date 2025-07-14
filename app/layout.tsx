import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a0d2e',
  colorScheme: 'dark',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://hypergit.app'),
  title: 'HyperGit - Lightning Fast GitHub File Search',
  description: 'Search across all your GitHub repositories with lightning speed. Find any file instantly with an intuitive @-mention syntax.',
  authors: [{ name: 'Dimillian', url: 'https://dimillian.app' }],
  keywords: ['GitHub', 'file search', 'developer tools', 'code search', 'repository search'],
  icons: {
    icon: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HyperGit',
  },
  openGraph: {
    title: 'HyperGit - Lightning Fast GitHub File Search',
    description: 'Search across all your GitHub repositories with lightning speed. Find any file instantly with an intuitive @-mention syntax.',
    url: 'https://hypergit.app',
    siteName: 'HyperGit',
    images: [
      {
        url: 'https://github.com/Dimillian/HyperGit/raw/main/app/opengraph-image.png',
        width: 1200,
        height: 924,
        alt: 'HyperGit - Lightning fast GitHub file search interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HyperGit - Lightning Fast GitHub File Search',
    description: 'Search across all your GitHub repositories with lightning speed. Find any file instantly with an intuitive @-mention syntax.',
    images: ['https://github.com/Dimillian/HyperGit/raw/main/app/twitter-image.png'],
    creator: '@dimillian',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" suppressHydrationWarning>
        <div className="main-background">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
