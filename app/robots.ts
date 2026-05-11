import type { MetadataRoute } from 'next'

const STUB_DISALLOW = ['/api/', '/services/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: STUB_DISALLOW,
      },
      // Explicit AI crawler allows — opt-in to citation in AI search engines.
      // Repeat the stub disallow so AI crawlers don't ingest "Coming soon"
      // pages into retrieval indices while the service tree is thin.
      { userAgent: 'GPTBot',         allow: '/', disallow: STUB_DISALLOW },
      { userAgent: 'OAI-SearchBot',  allow: '/', disallow: STUB_DISALLOW },
      { userAgent: 'ChatGPT-User',   allow: '/', disallow: STUB_DISALLOW },
      { userAgent: 'ClaudeBot',      allow: '/', disallow: STUB_DISALLOW },
      { userAgent: 'anthropic-ai',   allow: '/', disallow: STUB_DISALLOW },
      { userAgent: 'PerplexityBot',  allow: '/', disallow: STUB_DISALLOW },
      { userAgent: 'Google-Extended',allow: '/', disallow: STUB_DISALLOW },
      { userAgent: 'CCBot',          allow: '/', disallow: STUB_DISALLOW },
    ],
    sitemap: 'https://www.metaborong.com/sitemap.xml',
    host: 'https://www.metaborong.com',
  }
}
