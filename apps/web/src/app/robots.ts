import type { MetadataRoute } from 'next'
import { buildRobots, isSiteLive } from '@/lib/seo/robots'

export default function robots(): MetadataRoute.Robots {
  return buildRobots({ isLive: isSiteLive() })
}