import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'AI and Blockchain Development Company | Web3 & GenAI | Metaborong',
    template: '%s | Metaborong',
  },
  description:
    'Metaborong builds DeFi protocols, AI agent systems, and custom SaaS products for founders and crypto-native teams. Fast delivery, product-first thinking.',
  metadataBase: new URL('https://www.metaborong.com'),
  openGraph: {
    siteName: 'Metaborong',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
