import type { Metadata } from 'next'
import './globals.css'
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
import { ConsentBanner, ConsentRevokePill } from '@/components/consent/consent-banner'

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
      {/* suppressHydrationWarning targets a known dev-time mismatch: browser
          extensions (Grammarly is the most common offender — `data-gr-*`,
          `data-new-gr-c-s-check-loaded`) inject attributes into <body> before
          React hydrates. The flag suppresses *only* the body element's
          attribute mismatch, not anything inside it. */}
      <body suppressHydrationWarning>
        {children}
        <ConsentBanner />
        <ConsentRevokePill />
      </body>
    </html>
  )
}
