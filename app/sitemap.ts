import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    {
      url: 'https://www.metaborong.com/',
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Hub + service pages are noindex stubs and intentionally excluded.
    // Add them here when real content ships.
  ]
}
