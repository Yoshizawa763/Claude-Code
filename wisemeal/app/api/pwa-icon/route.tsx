import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = Math.min(Number(searchParams.get('size') || '512'), 512)

  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: size * 0.22,
        fontSize: size * 0.52,
      }}
    >
      🥗
    </div>,
    { width: size, height: size }
  )
}
