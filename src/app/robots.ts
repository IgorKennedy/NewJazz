import type { MetadataRoute } from 'next'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.newjazzoficial.com.br'
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: '/admin' }, sitemap: `${SITE}/sitemap.xml` }
}
