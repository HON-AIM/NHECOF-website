import type { MetadataRoute } from 'next'
import { getSitemap } from '@/lib/seo/sitemap'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemap()
}