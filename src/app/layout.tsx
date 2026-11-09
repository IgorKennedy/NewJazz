import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.newjazzoficial.com.br'
const T = 'New Jazz | Banda de jazz ao vivo para casamentos e eventos em Atibaia e Piracaia'
const D = 'Banda de jazz ao vivo para casamentos, eventos corporativos e restaurantes em Atibaia, Piracaia e região. Quarteto instrumental com jazz, MPB e clássicos. Peça seu orçamento.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: T, template: '%s | New Jazz' },
  description: D,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: { type: 'website', locale: 'pt_BR', siteName: 'New Jazz', url: '/', title: T, description: D, images: [{ url: '/img/band-1.jpg', width: 1080, height: 720, alt: 'Banda New Jazz em apresentação ao vivo' }] },
  twitter: { card: 'summary_large_image', title: T, description: D },
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#000000' }

const stack = `-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",${inter.style.fontFamily},system-ui,sans-serif`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js")' }} /></head>
      <body className={inter.variable} style={{ ['--f' as any]: stack }}>{children}</body>
    </html>
  )
}
