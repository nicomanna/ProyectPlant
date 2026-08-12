import { ImageResponse } from 'next/og'
import { renderAppIcon } from '@/lib/appIcon'

// Íconos que referencia el manifest. Se generan en build y quedan cacheados
// estáticamente. Ver docs/features/pwa.md.
const VARIANTS = {
  '192': { size: 192, maskable: false },
  '512': { size: 512, maskable: false },
  maskable: { size: 512, maskable: true },
} as const

type Variant = keyof typeof VARIANTS

export function generateStaticParams(): { variant: Variant }[] {
  return (Object.keys(VARIANTS) as Variant[]).map((variant) => ({ variant }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params
  const config = VARIANTS[variant as Variant]

  if (!config) return new Response('Not found', { status: 404 })

  return new ImageResponse(renderAppIcon(config), {
    width: config.size,
    height: config.size,
  })
}
