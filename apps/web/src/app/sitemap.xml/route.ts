export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour

export const GET = async () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2333'
  const res = await fetch(`${baseUrl}/sitemap`)
  if (!res.ok) throw new Error('Failed to fetch sitemap')
  const xml = await res.text()
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}