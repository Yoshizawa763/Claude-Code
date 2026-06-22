import { prisma } from '@/lib/prisma'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '(not set, using file:./dev.db)'
  const hasToken = !!process.env.TURSO_AUTH_TOKEN

  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ ok: true, dbUrl, hasToken })
  } catch (e) {
    return Response.json({ ok: false, dbUrl, hasToken, error: String(e) }, { status: 500 })
  }
}
